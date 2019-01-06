from typing import Type

from django_typescript.object_types.object_type import ObjectType
from django_typescript.core.utils.typescript_template import TypeScriptTemplate
from django_typescript.core.types import ModelPool
from django_typescript.transpile.method import MethodTranspiler
from django_typescript.transpile import templates
from django_typescript.core import types
from django_typescript.transpile.common import render_type_declaration
from django_typescript.transpile.type_transpiler import TypeTranspiler


# =================================
# Object Type Transpiler
# ---------------------------------

class ObjectTypeTranspiler(object):

    def __init__(self, object_type: Type[ObjectType], model_pool: ModelPool):
        self.object_type = object_type
        self.model_pool = model_pool

    @property
    def field_interface_name(self):
        return self.object_type.__name__ + "Fields"

    @property
    def serializer_cls(self) -> types.SerializerClass:
        return self.object_type._SERIALIZER_CLS

    def field_type_declarations(self):
        type_declarations = []
        serializer_fields = self.serializer_cls().get_fields()
        for field_name, field in serializer_fields.items():
            type_declarations.append(
                render_type_declaration(
                    name=field_name,
                    optional=field.allow_null,
                    readonly=field.read_only,
                    type_=TypeTranspiler.transpile(field))
            )
        return "\n".join(type_declarations)

    def _methods(self):
        methods = []
        for method_view in self.object_type.method_views():
            methods.append(
                MethodTranspiler(
                    name=method_view.name,
                    url=self.object_type.base_url() + "/" + method_view.url_path,
                    arg_serializer_cls=method_view.arg_serializer_cls,
                )
            )
        return methods

    def _static_methods(self):
        static_methods = []
        for static_method_view in self.object_type.static_method_views():
            static_methods.append(
                MethodTranspiler(
                    name=static_method_view.name,
                    url=self.object_type.base_url() + "/" + static_method_view.url_path,
                    arg_serializer_cls=static_method_view.arg_serializer_cls,
                )
            )
        return static_methods

    def init_mapping(self):
        field_maps = []
        serializer_fields = self.serializer_cls().get_fields()
        for field_name in serializer_fields.keys():
            field_maps.append(f"{field_name}: this.{field_name}")
        return ",\n".join(field_maps)

    def transpile(self) -> str:
        field_type_declarations = self.field_type_declarations()
        template = TypeScriptTemplate.open(templates.OBJECT_TYPE_TEMPLATE_FILE)
        source = template.render(
            methods=self._methods(),
            static_methods=self._static_methods(),
            object_class_types=field_type_declarations,
            object_name=self.object_type.__name__,
            field_interface_name=self.object_type.__name__ + "Fields",
            object_interface_types=field_type_declarations,
            init_mapping=self.init_mapping()
        )
        return source


