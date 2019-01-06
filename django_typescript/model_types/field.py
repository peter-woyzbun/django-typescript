from typing import List

from django.db import models
from rest_framework import serializers

from django_typescript.core import types


# =================================
# Model Type Field
# ---------------------------------

class ModelTypeField(object):

    FORWARD_RELATION_SUFFIX = '_id'
    AUTO_FIELD_SERIALIZER = serializers.IntegerField

    def __init__(self, model_field: models.Field, serializer_field: serializers.Field = None,
                 serializer_field_name: str = None):
        self.model_field = model_field
        self.serializer_field = serializer_field
        self.serializer_field_name = serializer_field_name if serializer_field_name else model_field.name
        self.base_lookup_key = serializer_field_name if serializer_field_name else model_field.name

    @property
    def name(self):
        if self.serializer_field_name:
            return self.serializer_field_name
        return self.model_field.name

    @classmethod
    def for_relation(cls, model_field: types.RelationField) -> 'ModelTypeField':
        """
        Returns a `ModelTypeField` for given relation model field. This is
        a special case, as forward relations get a special serializer field
        name - <model_field_name>_id - and reverse relations have no serializer.


        """
        serializer_field = None
        if types.field_is_forward_relation(model_field):
            pk_field = model_field.related_model._meta.pk
            if isinstance(pk_field, models.AutoField):
                serializer_field_cls = cls.AUTO_FIELD_SERIALIZER
            else:
                serializer_field_cls = serializers.ModelSerializer.serializer_field_mapping[model_field]
            serializer_field = serializer_field_cls(allow_null=model_field.null, default=model_field.default)
        return cls(model_field=model_field, serializer_field=serializer_field,
                   serializer_field_name=model_field.name + cls.FORWARD_RELATION_SUFFIX)

    @property
    def reverse_lookup_key(self):
        assert isinstance(self.model_field, models.ManyToOneRel), "Only reverse relations have a `reverse_lookup_key`."
        related_field = self.model_field.get_related_field()
        for field in self.model_field.related_model._meta.get_fields():
            if isinstance(field, models.ForeignKey):
                if field.remote_field.related_name == self.model_field.name:
                    return field.name + '__' + related_field.name

    @property
    def related_model_name(self):
        assert types.field_is_relation(self.model_field), "Only relation fields have a `related_model_name`."
        return self.model_field.related_model.__name__

    @staticmethod
    def _lookup_key(*parts: str):
        return "__".join(parts)

    def _base_lookup_info(self, prefixes: List[str]) -> types.FieldLookupInfo:
        """
        Return the 'base' lookup info for this field.

        """

        return self._lookup_key(*(prefixes + [self.base_lookup_key])), self.model_field, None

    def lookup_info(self, model_pool: types.ModelPool, visited_models: types.ModelPool = None,
                    model_field: types.ModelField = None, prefixes: List[str]=None) -> List[types.FieldLookupInfo]:
        if model_field is None:
            model_field = self.model_field
        if visited_models is None:
            visited_models = []
        if prefixes is None:
            prefixes = []
        lookup_info = []
        # No base lookup is defined for relation fields - we use the nested field lookups,
        # e.g: 'relation_field__id=<number>', rather than 'relation_field=<ModelInstance>'.
        if not types.field_is_relation(model_field):
            lookup_info.append(self._base_lookup_info(prefixes))
            for lookup_str, lookup_cls in model_field.get_lookups().items():
                lookup_info.append(
                    (self._lookup_key(*(prefixes + [self.base_lookup_key] + [lookup_str])), model_field, lookup_cls)
                )
        if types.field_is_relation(model_field):
            if model_field.related_model in model_pool and not model_field.related_model in visited_models:
                for nested_model_field in model_field.related_model._meta.get_fields():
                    nested_field = ModelTypeField(model_field=nested_model_field)
                    lookup_info += nested_field.lookup_info(
                        model_pool=model_pool,
                        visited_models=visited_models + [model_field.model],
                        prefixes=[model_field.name] + prefixes
                    )
        return lookup_info




