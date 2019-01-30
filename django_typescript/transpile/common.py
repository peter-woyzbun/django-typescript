from django_typescript.core.utils.signature import Signature
from django_typescript.transpile.field_type import FieldTypeTranspiler
from django_typescript.core import typescript_types


# =================================
# Render Type Declaration
# ---------------------------------

def render_type_declaration(name: str, optional: bool, readonly: bool, type_: str):
    return (readonly * "readonly ") + name + (optional * "?") + ": " + type_


# =================================
# Method Signature
# ---------------------------------

def method_sig_interface(arg_serializer_cls=None, signature: Signature = None):
    type_declarations = []
    if arg_serializer_cls:
        serializer_fields = arg_serializer_cls().get_fields()
        for field_name, field in serializer_fields.items():
            type_declarations.append(
                render_type_declaration(
                    name=field_name,
                    optional=field.allow_null,
                    readonly=field.read_only,
                    type_=FieldTypeTranspiler.transpile(field))
            )
        return "data: {" + ", ".join(type_declarations) + "}"
    if signature:
        if len(signature) > 0:
            for param_name in signature.param_names:
                type_declarations.append(
                    render_type_declaration(
                        name=param_name,
                        optional=False,
                        readonly=False,
                        type_=typescript_types.ANY)
                )
            return "data: {" + ", ".join(type_declarations) + "}"
    return ''
