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
        serializer_field_name = None
        if types.field_is_forward_relation(model_field):
            pk_field = model_field.related_model._meta.pk

            if isinstance(pk_field, models.AutoField):
                serializer_field_cls = cls.AUTO_FIELD_SERIALIZER
            # Todo: this requires recursive logic...
            if isinstance(pk_field, models.OneToOneField):
                target_pk_field = pk_field.related_model._meta.pk
                serializer_field_cls = serializers.ModelSerializer.serializer_field_mapping[type(target_pk_field)]
            else:
                serializer_field_cls = serializers.ModelSerializer.serializer_field_mapping[type(pk_field)]
            serializer_field = serializer_field_cls(allow_null=model_field.null, default=model_field.default)
            serializer_field_name = model_field.db_column
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

    def _base_lookup_info(self) -> types.FieldLookupInfo:
        """
        Return the 'base' lookup info for this field.

        """

        return self._lookup_key(*([self.base_lookup_key])), self.model_field, None

    def lookup_info(self, model_pool: types.ModelPool) -> List[types.FieldLookupInfo]:
        lookup_info = []
        # Many-to-many fields are not currently supported.
        if isinstance(self.model_field, models.ManyToManyField):
            return []
        # No base lookup is defined for relation fields - we use the nested field lookups,
        # e.g: 'relation_field__id=<number>', rather than 'relation_field=<ModelInstance>'.
        if not types.field_is_relation(self.model_field):
            lookup_info.append(self._base_lookup_info())
            for lookup_str, lookup_cls in self.model_field.get_lookups().items():
                lookup_info.append(
                    (self._lookup_key(*([self.base_lookup_key] + [lookup_str])), self.model_field, lookup_cls)
                )
        else:
            if self.model_field.related_model in model_pool:
                lookup_info.append((self.model_field.name, self.model_field.related_model, None))
        return lookup_info




