from typing import Dict, Callable

from django.db import models
from rest_framework import serializers
from rest_framework.utils.field_mapping import get_field_kwargs, UniqueValidator

from django_typescript.core import types
from django_typescript.core.model_inspector import ModelInspector
from django_typescript.model_types.validator import ModelTypeValidator


# =================================
# Serializer Registry
# ---------------------------------

_REGISTRY: Dict[types.ModelClass, 'ModelTypeSerializer'] = {}


# =================================
# Model Type Serializer
# ---------------------------------

class ModelTypeSerializer(object):

    AUTO_FIELD_SERIALIZER = serializers.IntegerField

    def __init__(self, model_cls: types.ModelClass, validator: Callable = None):
        self.model_cls = model_cls
        self.validator = validator
        self.model_inspector = ModelInspector(model_cls=model_cls)
        self.concrete_fields: Dict[str, types.FieldSerializer] = {}
        self.forward_rel_fields: Dict[str, types.FieldSerializer] = {}
        self.forward_rel_model_fields: Dict[str, types.ModelField] = {}
        self.base_serializer_cls: types.ModelSerializerClass = None

        self._build_fields()
        self._build_serializer_cls()

    @property
    def field_names(self):
        return list(self.concrete_fields.keys()) + list(self.forward_rel_fields.keys())

    def _build_fields(self):
        self._build_concrete_fields()
        self._build_forward_relation_fields()

    def _build_concrete_fields(self):
        helper_serializer = serializers.ModelSerializer()
        for model_field in self.model_inspector.concrete_fields:
            field_class, field_kwargs = helper_serializer.build_standard_field(model_field.name, model_field)
            self.concrete_fields[model_field.name] = field_class(**field_kwargs)

    @staticmethod
    def _forward_rel_field_kwargs(model_field: types.ModelField):
        kwargs = {}
        if model_field.has_default() or model_field.blank or model_field.null:
            kwargs['required'] = False
        if model_field.null:
            kwargs['allow_null'] = True
        if model_field.validators:
            kwargs['validators'] = model_field.validators
        if getattr(model_field, 'unique', False):
            validator = UniqueValidator(queryset=model_field.model._default_manager)
            kwargs['validators'] = kwargs.get('validators', []) + [validator]
        return kwargs

    def _resolve_forward_rel_field_type(self, model_field: types.ForwardRelationField):
        pk_field = model_field.related_model._meta.pk
        if isinstance(pk_field, models.AutoField):
            return self.AUTO_FIELD_SERIALIZER
        if isinstance(pk_field, models.OneToOneField):
            return self._resolve_forward_rel_field_type(pk_field)
        return serializers.ModelSerializer.serializer_field_mapping[type(pk_field)]

    def _build_forward_relation_fields(self):
        for model_field in self.model_inspector.forward_relation_fields:
            field_class = self._resolve_forward_rel_field_type(model_field=model_field)
            field_kwargs = self._forward_rel_field_kwargs(model_field=model_field)
            field_name = model_field.get_attname()
            self.forward_rel_fields[field_name] = field_class(**field_kwargs)
            self.forward_rel_model_fields[field_name] = model_field

    def _build_serializer_cls(self):

        valid_field_names = self.field_names + [f.name for f in self.forward_rel_model_fields.values()]

        class Meta:
            model = self.model_cls
            fields = self.field_names

        def validate(_self, attrs):
            if self.validator:
                validator = ModelTypeValidator(validate_func=self.validator,
                                               forward_relation_fields=self.forward_rel_model_fields)
                assert len(set(validator.validator_field_names) - set(valid_field_names)) == 0, (
                    'One or more arguments of provided `validate` method does not correspond to a field name.'
                )
                validator.validate(**dict(attrs))
            return serializers.ModelSerializer.validate(_self, attrs)

        class_dict = {
            **{'Meta': Meta, 'validate': validate},
            **self.concrete_fields,
            **self.forward_rel_fields
        }
        serializer_cls = type(self.model_cls.__name__ + "Serializer", (serializers.ModelSerializer,), class_dict)
        self.base_serializer_cls = serializer_cls


