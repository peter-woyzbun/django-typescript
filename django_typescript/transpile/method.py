from rest_framework import serializers

from django_typescript.core import types
from django_typescript.transpile.common import render_type_declaration
from django_typescript.transpile.type_transpiler import TypeTranspiler


# =================================
# Method Transpiler
# ---------------------------------

class MethodTranspiler(object):

    def __init__(self, name: str, url: str, arg_serializer_cls: types.SerializerClass):
        self.name = name
        self.url = url
        self.arg_serializer_cls = arg_serializer_cls

    @property
    def sig_interface(self):
        type_declarations = []
        serializer_fields = self.arg_serializer_cls().get_fields()
        for field_name, field in serializer_fields.items():
            type_declarations.append(
                render_type_declaration(
                    name=field_name,
                    optional=field.allow_null,
                    readonly=field.read_only,
                    type_=TypeTranspiler.transpile(field))
            )
        return "{" + ", ".join(type_declarations) + "}"
