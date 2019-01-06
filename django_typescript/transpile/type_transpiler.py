import inspect

from django.db import models
from django.db.models import lookups
from django.db.models.fields import related_lookups
try:
    from django.contrib.postgres.fields import JSONField, ArrayField
except:
    JSONField = 'JSONField'
    ArrayField = 'ArrayField'
from rest_framework import serializers

from django_typescript.core import typescript_types


# =================================
# Type Transpiler
# ---------------------------------

class TypeTranspiler(object):

    _DEFAULT_TYPE = lambda x: typescript_types.ANY

    TYPE_TRANSPILERS = {
        # Serializer field types
        serializers.IntegerField: lambda x: typescript_types.NUMBER,
        serializers.CharField: lambda x: typescript_types.STRING,
        serializers.FloatField: lambda x: typescript_types.NUMBER,
        serializers.JSONField: lambda x: typescript_types.OBJECT,
        serializers.ListField: lambda x: TypeTranspiler.transpile(x.child),
        serializers.PrimaryKeyRelatedField: lambda x: TypeTranspiler.transpile(x.queryset.model),
        # Django model field types
        JSONField: lambda x: typescript_types.OBJECT,
        models.CharField: lambda x: typescript_types.STRING,
        models.TextField: lambda x: typescript_types.STRING,
        models.UUIDField: lambda x: typescript_types.STRING,
        models.SlugField: lambda x: typescript_types.STRING,
        models.SmallIntegerField: lambda x: typescript_types.STRING,
        models.BigIntegerField: lambda x: typescript_types.NUMBER,
        models.EmailField: lambda x: typescript_types.STRING,
        models.URLField: lambda x: typescript_types.STRING,
        models.IntegerField: lambda x: typescript_types.NUMBER,
        models.PositiveIntegerField: lambda x: typescript_types.NUMBER,
        models.PositiveSmallIntegerField: lambda x: typescript_types.NUMBER,
        models.DecimalField: lambda x: typescript_types.NUMBER,
        models.FloatField: lambda x:  typescript_types.NUMBER,
        models.AutoField: lambda x: typescript_types.NUMBER,
        models.BigAutoField: lambda x: typescript_types.NUMBER,
        models.BooleanField: lambda x: typescript_types.BOOLEAN,
        models.NullBooleanField: lambda x: f"{typescript_types.BOOLEAN} | {typescript_types.NULL}",
        models.DateTimeField: lambda x: typescript_types.DATE,
        models.DateField: lambda x: typescript_types.DATE,
        models.ForeignKey: lambda x: x.related_model.__name__,
        models.OneToOneField: lambda x: x.related_model.__name__,
        models.ManyToManyField: lambda x: x.related_model.__name__,
        models.ManyToOneRel: lambda x: x.related_model.__name__,
        ArrayField: lambda x: TypeTranspiler.transpile(x.base_field) + "[]",
        # Model type
        models.Model: lambda x: x.__name__,
        # Container types
        lookups.In: lambda x: f'{x}[]',
        related_lookups.RelatedIn: lambda x: f'{x}[]',
        lookups.Range: lambda x: f'[{x}, {x}]',
    }

    @classmethod
    def transpile(cls, type_, container_type=None):
        if not inspect.isclass(type_):
            base_type = type(type_)
        else:
            base_type = type_
        root_type = cls.TYPE_TRANSPILERS.get(base_type, cls._DEFAULT_TYPE)(type_)
        if not container_type or container_type not in cls.TYPE_TRANSPILERS:
            return root_type
        return cls.TYPE_TRANSPILERS[container_type](root_type)

