from django_typescript.core import types
from django_typescript.model_types import ModelType, ModelView
from django_typescript.transpile.type_transpiler import TypeTranspiler
from django_typescript.transpile.common import render_type_declaration
from django_typescript.core.utils.typescript_template import TypeScriptTemplate
from django_typescript.transpile import templates
from django_typescript.transpile.method import MethodTranspiler
from django_typescript.transpile.literal import LiteralTranspiler


# =================================
# Model Type Transpiler
# ---------------------------------

class ModelTypeTranspiler(object):

    QUERYSET_SUFFIX = 'QuerySet'
    QUERYSET_LOOKUPS_SUFFIX = QUERYSET_SUFFIX + 'Lookups'
    FOREIGN_KEY_DECORATOR_NAME = 'foreignKeyField'
    TYPESCRIPT_THIS_PK_REF = '${this.pk()}'
    TYPESCRIPT_ARG_PK_REF = '${primaryKey}'
    FIELDS_INTERFACE_SUFFIX = 'Fields'

    def __init__(self, model_type: ModelType, model_pool: types.ModelPool):
        self.model_type = model_type
        self.model_pool = model_pool

    def _view_url(self, view: ModelView, use_this_pk=True):
        prefix = self.model_type.base_url() + '/'
        if use_this_pk:
            return prefix + view.url_path.replace(ModelView.PK_PARAMETER, self.TYPESCRIPT_THIS_PK_REF)
        return prefix + view.url_path.replace(ModelView.PK_PARAMETER, self.TYPESCRIPT_ARG_PK_REF)

    @property
    def lookups_interface_name(self):
        return self.model_type.model_name + self.QUERYSET_LOOKUPS_SUFFIX

    @property
    def queryset_name(self):
        return self.model_type.model_name + self.QUERYSET_SUFFIX

    @property
    def field_interface_name(self):
        return self.model_type.model_name + self.FIELDS_INTERFACE_SUFFIX

    def queryset_lookup_types(self):
        type_declarations = []
        for lookup_key, model_field, lookup_cls in self.model_type.field_lookup_info(model_pool=self.model_pool):
            type_declarations.append(render_type_declaration(
                name=lookup_key,
                optional=True,
                readonly=False,
                type_=TypeTranspiler.transpile(type_=model_field, container_type=lookup_cls)
            ))
        return "\n".join(type_declarations)

    def model_interface_types(self):
        type_declarations = []
        for field in self.model_type.forward_relation_fields + self.model_type.concrete_fields:
            type_declarations.append(render_type_declaration(
                name=field.name,
                optional=field.serializer_field.allow_null,
                readonly=field.serializer_field.read_only,
                type_=TypeTranspiler.transpile(type_=field.serializer_field)
            ))
        return "\n".join(type_declarations)

    def model_class_types(self):
        type_declarations = []
        for field in self.model_type.forward_relation_fields:
            type_declarations.append(
                f"@{self.FOREIGN_KEY_DECORATOR_NAME}(() => {field.related_model_name}) " + field.model_field.name + "?: " + field.related_model_name
            )
        return "\n".join([self.model_interface_types()] + type_declarations)

    def _methods(self):
        methods = []
        for method_view in self.model_type.method_views:
            methods.append(
                MethodTranspiler(
                    name=method_view.name,
                    url=self._view_url(view=method_view, use_this_pk=True),
                    arg_serializer_cls=method_view.arg_serializer_cls,
                )
            )
        return methods

    def _static_methods(self):
        static_methods = []
        for static_method_view in self.model_type.static_method_views:
            static_methods.append(
                MethodTranspiler(
                    name=static_method_view.name,
                    url=self._view_url(view=static_method_view, use_this_pk=False),
                    arg_serializer_cls=static_method_view.arg_serializer_cls,
                )
            )
        return static_methods

    def reverse_relations(self):
        return [f for f in self.model_type.reverse_relation_fields if f.model_field.related_model in self.model_pool]

    def field_schemas(self):
        field_schemas = []
        for field in self.model_type.concrete_fields:
            schema = f"fieldName:'{field.name}'," \
                     f"fieldType:'{field.model_field.__class__.__name__}'," \
                     f"nullable:{LiteralTranspiler.transpile(field.model_field.null)}," \
                     f"isReadOnly:{LiteralTranspiler.transpile(field.serializer_field.read_only)}"
            field_schemas.append(
                field.name + ": {" + schema + "}"
            )
        for field in self.model_type.forward_relation_fields:
            schema = f"fieldName:'{field.name}'," \
                     f"fieldType:'{field.model_field.__class__.__name__}'," \
                     f"nullable:{LiteralTranspiler.transpile(field.model_field.null)}," \
                     f"isReadOnly:{LiteralTranspiler.transpile(field.serializer_field.read_only)}," \
                     f"relatedModel: {field.related_model_name}"
            field_schemas.append(
                field.name + ": {" + schema + "}"
            )

        return ", \n".join(field_schemas)

    def transpile(self):
        template = TypeScriptTemplate.open(templates.MODEL_TYPE_TEMPLATE_FILE)
        source = template.render(
            pk_field_name=self.model_type.model_inspector.pk_field_name,
            pk_type=TypeTranspiler.transpile(self.model_type.model_inspector.pk_field),
            model_name=self.model_type.model_name,
            queryset_name=self.queryset_name,
            field_interface_name=self.field_interface_name,
            update_url=self._view_url(view=self.model_type.update_view),
            get_url=self._view_url(view=self.model_type.get_view, use_this_pk=False),
            create_url=self._view_url(view=self.model_type.create_view),
            list_url=self._view_url(view=self.model_type.list_view),
            delete_url=self._view_url(view=self.model_type.delete_view),
            model_interface_types=self.model_interface_types(),
            model_class_types=self.model_class_types(),
            lookups_interface_name=self.lookups_interface_name,
            queryset_lookups=self.queryset_lookup_types(),
            reverse_relations=self.reverse_relations(),
            methods=self._methods(),
            static_methods=self._static_methods(),
            field_schemas=self.field_schemas()
        )
        return source
