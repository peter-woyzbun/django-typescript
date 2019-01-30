from typing import List

from django_typescript.core import types
from django_typescript.transpile.model_type.common import (model_lookups_name,
                                                           forward_relation_getter_setter,
                                                           model_prefetch_type_name)
from django_typescript.transpile.literal import LiteralTranspiler
from django_typescript.transpile.field_type import FieldTypeTranspiler
from django_typescript.transpile.common import render_type_declaration


# =================================
# Forward Relation Field Transpiler
# ---------------------------------

class ForwardRelFieldTranspiler(object):

    def __init__(self, serializer_field_name: str, model_field: types.ModelField,
                 serializer_field: types.FieldSerializer):
        self.serializer_field_name = serializer_field_name
        self.model_field = model_field
        self.serializer_field = serializer_field

    def schema(self):
        return "{ " + self._schema_body() + " }"

    @property
    def prefetch_type(self):
        base_key = self.model_field.name
        related_prefetch_type = model_prefetch_type_name(self.model_field.related_model)
        return f"'{base_key}' | {{{base_key}: {related_prefetch_type}}}"

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
                type_=FieldTypeTranspiler.transpile(type_=self.serializer_field)
            )

    def _schema_body(self):
        schema = f"fieldName:'{self.serializer_field_name}'," \
                 f"fieldType:'{self.serializer_field.__class__.__name__}'," \
                 f"nullable:{LiteralTranspiler.transpile(self.model_field.null)}," \
                 f"isReadOnly:{LiteralTranspiler.transpile(self.serializer_field.read_only)}," \
                 f"relatedModel: () => {self.model_field.related_model.__name__}"
        return schema

    def getter_setter_type_declaration(self):
        """
        Forward relation fields have a special model declaration. It is a
        decorated parameter for handling logic for fetching the relation.

        """
        return forward_relation_getter_setter(related_model=self.model_field.related_model,
                                              field_name=self.model_field.name)

    def lookup_declarations(self):
        return [
            render_type_declaration(
                name=self.model_field.get_attname(),
                optional=True,
                readonly=False,
                type_=FieldTypeTranspiler.transpile(self.serializer_field)
            ),
            render_type_declaration(
                name=self.model_field.name,
                optional=True,
                readonly=False,
                type_=model_lookups_name(model_cls=self.model_field.related_model)
            )
        ]

