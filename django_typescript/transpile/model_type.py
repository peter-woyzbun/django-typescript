from typing import List
from collections import namedtuple

from django.db import models

from django_typescript.core import types, endpoints
from django_typescript.core.field_info import FieldInfo
from django_typescript.model_types import ModelType, ModelView
from django_typescript.core.utils.typescript_template import TypeScriptTemplate
from django_typescript.transpile.field_type import FieldTypeTranspiler
from django_typescript.transpile.literal import LiteralTranspiler
from django_typescript.transpile import templates
from django_typescript.transpile.common import render_type_declaration, method_sig_interface


# =================================
# Constants
# ---------------------------------

QUERYSET_SUFFIX = 'QuerySet'
QUERYSET_LOOKUPS_SUFFIX = QUERYSET_SUFFIX + 'Lookups'
FOREIGN_KEY_DECORATOR_NAME = 'foreignKeyField'
TYPESCRIPT_THIS_PK_REF = '${this.pk()}'
TYPESCRIPT_ARG_PK_REF = '${primaryKey}'
FIELDS_INTERFACE_SUFFIX = 'Fields'
PREFETCH_KEY_TYPE_SUFFIX = 'PrefetchKey'


# =================================
# Utils
# ---------------------------------

def model_queryset_name(model_cls: types.ModelClass):
    return model_cls.__name__ + QUERYSET_SUFFIX


def model_field_interface_name(model_cls: types.ModelClass):
    return model_cls.__name__ + FIELDS_INTERFACE_SUFFIX


def model_lookups_name(model_cls: types.ModelClass):
    return model_cls.__name__ + QUERYSET_LOOKUPS_SUFFIX


def model_prefetch_type_name(model_cls: types.ModelClass):
    return model_cls.__name__ + PREFETCH_KEY_TYPE_SUFFIX


ModelMethod = namedtuple('ModelMethod', ['name', 'sig_interface', 'url'])
ReverseRelation = namedtuple('ReverseRelation', ['name', 'lookups_type', 'queryset_name', 'lookup_key'])


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
    PREFETCH_TYPE_SUFFIX = 'Prefetch'

    def __init__(self, model_type: ModelType, model_pool: types.ModelPool):
        self.model_type = model_type
        self.model_pool = model_pool
        self.pk_field_info: FieldInfo = None

        self._resolve_pk_field_info()

    @property
    def _url_prefix(self):
        return self.model_type.base_url() + '/'

    def _resolve_pk_field_info(self):
        for field_info in self.model_type.serializer.field_info:
            if field_info.is_pk:
                self.pk_field_info = field_info

    def _field_lookup_info(self) -> List[types.FieldLookupInfo]:
        lookups = []
        for field_info in self.model_type.serializer.field_info:
            lookups += field_info.lookup_info(model_pool=self.model_pool)
        for rev_rel_field in self.model_type.model_inspector.reverse_relation_fields:

            lookups.append((rev_rel_field.name, rev_rel_field.related_model, None))
        return lookups

    def queryset_lookup_types(self):
        type_declarations = []
        for lookup_key, model_field_or_model, lookup_cls in self._field_lookup_info():
            if isinstance(model_field_or_model, models.ManyToManyField):
                continue
            if isinstance(model_field_or_model, models.Field):
                type_declarations.append(render_type_declaration(
                    name=lookup_key,
                    optional=True,
                    readonly=False,
                    type_=FieldTypeTranspiler.transpile(type_=model_field_or_model, container_type=lookup_cls)
                ))
            else:
                if model_field_or_model in self.model_pool:
                    type_declarations.append(render_type_declaration(
                        name=lookup_key,
                        optional=True,
                        readonly=False,
                        type_=model_field_or_model.__name__ + self.QUERYSET_LOOKUPS_SUFFIX
                    ))
        return "\n".join(type_declarations)

    def model_interface_types(self):
        type_declarations = []
        for field_info in self.model_type.serializer.field_info:
            type_declarations.append(render_type_declaration(
                name=field_info.serializer_field_name,
                optional=field_info.serializer.allow_null,
                readonly=field_info.serializer.read_only,
                type_=FieldTypeTranspiler.transpile(type_=field_info.serializer)
            ))
        return "\n".join(type_declarations)

    def model_class_types(self):
        type_declarations = []
        for field_info in self.model_type.serializer.field_info:
            if field_info.is_forward_relation:
                if field_info.model_field.related_model in self.model_pool:
                    related_model_name = field_info.model_field.related_model.__name__
                    field_name = field_info.model_field.name
                    type_declarations.append(
                        f"@{self.FOREIGN_KEY_DECORATOR_NAME}(() => {related_model_name}) " + field_name + "?: "
                        + related_model_name
                    )
        return "\n".join([self.model_interface_types()] + type_declarations)

    def model_prefetch_type_name(self, model_cls: types.ModelClass):
        return model_cls.__name__ + self.PREFETCH_TYPE_SUFFIX

    def _prefetch_type_body(self):
        prefetch_parts = []
        for field_info in self.model_type.serializer.field_info:
            if field_info.is_forward_relation:
                if field_info.model_field.related_model in self.model_pool:
                    base_key = field_info.model_field.name
                    related_prefetch_type = model_prefetch_type_name(field_info.model_field.related_model)
                    prefetch_parts.append(f"'{base_key}' | {{{base_key}: {related_prefetch_type}}}")
        if not prefetch_parts:
            return 'never'
        return " |\n ".join(prefetch_parts)

    def _methods(self) -> List[ModelMethod]:
        methods = []
        for method_view in self.model_type.method_views:
            methods.append(
                ModelMethod(
                    name=method_view.name,
                    url=self._url_prefix + method_view.endpoint.url(TYPESCRIPT_THIS_PK_REF),
                    sig_interface=method_sig_interface(method_view.arg_serializer_cls),
                )
            )
        return methods

    def _static_methods(self) -> List[ModelMethod]:
        static_methods = []
        for static_method_view in self.model_type.static_method_views:
            static_methods.append(
                ModelMethod(
                    name=static_method_view.name,
                    url=self._url_prefix + static_method_view.endpoint.url(),
                    sig_interface=method_sig_interface(static_method_view.arg_serializer_cls),
                )
            )
        return static_methods

    def _reverse_relations(self) -> List[ReverseRelation]:
        reverse_relations = []
        for model_field in self.model_type.model_inspector.reverse_relation_fields:

            if model_field.related_model in self.model_pool:
                related_field = model_field.get_related_field()
                lookup_key = None
                for field in model_field.related_model._meta.get_fields():
                    if isinstance(field, models.ForeignKey):
                        if field.remote_field.related_name == model_field.name:
                            lookup_key = field.name + '__' + related_field.name
                reverse_relations.append(
                    ReverseRelation(
                        name=model_field.name,
                        lookups_type=model_lookups_name(model_cls=model_field.related_model),
                        queryset_name=model_queryset_name(model_cls=model_field.related_model),
                        lookup_key=lookup_key
                    )
                )
        return reverse_relations

    def field_schemas(self):
        field_schemas = []
        for field_info in self.model_type.serializer.field_info:
            if not field_info.is_forward_relation:
                schema = f"fieldName:'{field_info.serializer_field_name}'," \
                         f"fieldType:'{field_info.model_field.__class__.__name__}'," \
                         f"nullable:{LiteralTranspiler.transpile(field_info.model_field.null)}," \
                         f"isReadOnly:{LiteralTranspiler.transpile(field_info.serializer.read_only)}"
                field_schemas.append(
                    field_info.serializer_field_name + ": {" + schema + "}"
                )
            else:
                if field_info.model_field.related_model in self.model_pool:
                    schema = f"fieldName:'{field_info.serializer_field_name}'," \
                             f"fieldType:'{field_info.serializer.__class__.__name__}'," \
                             f"nullable:{LiteralTranspiler.transpile(field_info.model_field.null)}," \
                             f"isReadOnly:{LiteralTranspiler.transpile(field_info.serializer.read_only)}," \
                             f"relatedModel: () => {field_info.model_field.related_model.__name__}"
                    field_schemas.append(
                        field_info.serializer_field_name + ": {" + schema + "}"
                    )

        return ", \n".join(field_schemas)

    def transpile(self):
        template = TypeScriptTemplate.open(templates.MODEL_TYPE_TEMPLATE_FILE)
        source = template.render(
            pk_field_name=self.pk_field_info.serializer_field_name,
            pk_type=FieldTypeTranspiler.transpile(self.pk_field_info.serializer),
            model_name=self.model_type.model_name,
            queryset_name=model_queryset_name(self.model_type.model_cls),
            field_interface_name=model_field_interface_name(self.model_type.model_cls),
            # URLS
            update_url=self._url_prefix + self.model_type.update_view.endpoint.url(TYPESCRIPT_THIS_PK_REF),
            get_url=self._url_prefix + self.model_type.get_view.endpoint.url(TYPESCRIPT_ARG_PK_REF),
            create_url=self._url_prefix + self.model_type.create_view.endpoint.url(TYPESCRIPT_ARG_PK_REF),
            list_url=self._url_prefix + self.model_type.list_view.endpoint.url(),
            delete_url=self._url_prefix + self.model_type.delete_view.endpoint.url(TYPESCRIPT_THIS_PK_REF),
            # -----
            model_interface_types=self.model_interface_types(),
            model_class_types=self.model_class_types(),
            lookups_interface_name=model_lookups_name(self.model_type.model_cls),
            queryset_lookups=self.queryset_lookup_types(),
            reverse_relations=self._reverse_relations(),
            methods=self._methods(),
            static_methods=self._static_methods(),
            field_schemas=self.field_schemas(),
            prefetch_type_name=model_prefetch_type_name(self.model_type.model_cls),
            prefetch_type=self._prefetch_type_body()
        )
        return source
