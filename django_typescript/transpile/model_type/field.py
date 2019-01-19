from typing import List

from django_typescript.core import types
from django_typescript.transpile.field_type import FieldTypeTranspiler
from django_typescript.transpile.common import render_type_declaration


# =================================
# Base Field Transpiler
# ---------------------------------

class BaseFieldTranspiler(object):

    def __init__(self, serializer_field_name: str, model_field: types.ModelField,
                 serializer_field: types.FieldSerializer = None):
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
        if self.serializer_field is None:
            raise AssertionError("A serialized type declaration can only be generated "
                                 "for fields with a corresponding `serializer_field`.")
        return render_type_declaration(
                name=self.serializer_field_name,
                optional=self.serializer_field.allow_null,
                readonly=self.serializer_field.read_only,
                type_=FieldTypeTranspiler.transpile(type_=self.serializer_field)
            )

    def model_type_declaration(self) -> str:
        raise NotImplementedError

    @staticmethod
    def _lookup_key(*parts: str):
        return "__".join(parts)

    def lookup_declarations(self) -> List[str]:
        raise NotImplementedError

    def schema(self):
        return "{ " + self.schema_body() + " }"

    def schema_body(self) -> str:
        raise NotImplementedError

