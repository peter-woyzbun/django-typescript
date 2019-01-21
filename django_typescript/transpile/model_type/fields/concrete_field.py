from typing import List

from django.db import models

from django_typescript.core import types
from django_typescript.transpile.field_type import FieldTypeTranspiler
from django_typescript.transpile.common import render_type_declaration
from django_typescript.transpile.model_type.common import datetime_getter_setter
from django_typescript.transpile.literal import LiteralTranspiler


# =================================
# Concrete Field Transpiler
# ---------------------------------

class ConcreteFieldTranspiler(object):

    def __init__(self, serializer_field_name: str, model_field: types.ModelField,
                 serializer_field: types.FieldSerializer):
        self.serializer_field_name = serializer_field_name
        self.model_field = model_field
        self.serializer_field = serializer_field

    def serialized_type_declaration(self) -> str:
        """
        Return the 'serialized' type declaration for this field. That is,
        the type corresponding to the value that will be sent to the server
        and serialized. These type declarations make of the body of a model's
        field interface type.

        """
        return render_type_declaration(
                name=self.serializer_field_name,
                optional=self.serializer_field.allow_null,
                readonly=self.serializer_field.read_only,
                type_=self._serialized_type
            )

    @property
    def _serialized_type(self):
        if self.model_field.choices:
            return self._choices_type
        return FieldTypeTranspiler.transpile(type_=self.serializer_field)

    @property
    def _choices_type(self):
        return " | ".join([LiteralTranspiler.transpile(c[0]) for c in self.model_field.choices])

    def _schema_body(self):
        schema = f"fieldName:'{self.serializer_field_name}'," \
                 f"fieldType:'{self.model_field.__class__.__name__}'," \
                 f"nullable:{LiteralTranspiler.transpile(self.model_field.null)}," \
                 f"isReadOnly:{LiteralTranspiler.transpile(self.serializer_field.read_only)}"
        return schema

    @property
    def _schema_field_choices(self):
        return [{'value': c[0], 'label': c[1]} for c in self.model_field.choices]

    def schema(self):
        schema = {
            'fieldName': self.serializer_field_name,
            'fieldType': self.model_field.__class__.__name__,
            'nullable': self.model_field.null,
            'isReadOnly': self.serializer_field.read_only
        }
        if self.model_field.choices:
            schema['choices'] = self._schema_field_choices
        return LiteralTranspiler.transpile(schema)

    @staticmethod
    def _lookup_key(*parts: str):
        return "__".join(parts)

    def lookup_declarations(self):
        declarations = list()
        declarations.append(render_type_declaration(
            name=self.serializer_field_name,
            optional=True,
            readonly=False,
            type_=self._serialized_type
        ))
        for lookup_str, lookup_cls in self.model_field.get_lookups().items():
            declarations.append(render_type_declaration(
                name=self._lookup_key(self.serializer_field_name, lookup_str),
                optional=True,
                readonly=False,
                type_=FieldTypeTranspiler.transpile(type_=self.model_field, container_type=lookup_cls)
            ))
        return declarations
