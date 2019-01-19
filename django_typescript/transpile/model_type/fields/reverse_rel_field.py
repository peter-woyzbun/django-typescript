from django.db import models

from django_typescript.core import types
from django_typescript.transpile.model_type.common import (model_lookups_name,
                                                           forward_relation_getter_setter,
                                                           model_queryset_name,
                                                           model_prefetch_type_name)
from django_typescript.transpile.common import render_type_declaration


# =================================
# Reverse Relation Field Transpiler
# ---------------------------------

class ReverseRelFieldTranspiler(object):

    def __init__(self, model_field: types.ReverseRelationField):
        self.model_field = model_field

    @property
    def is_one_to_one(self):
        return isinstance(self.model_field, models.OneToOneRel)

    def lookup_declarations(self):
        return [
            render_type_declaration(
                name=self.model_field.name,
                optional=True,
                readonly=False,
                type_=model_lookups_name(model_cls=self.model_field.related_model)
            )
        ]

    @property
    def prefetch_type(self):
        if self.is_one_to_one:
            base_key = self.model_field.name
            related_prefetch_type = model_prefetch_type_name(self.model_field.related_model)
            return f"'{base_key}' | {{{base_key}: {related_prefetch_type}}}"

    def getter_setter_type_declaration(self):
        if self.is_one_to_one:
            return forward_relation_getter_setter(related_model=self.model_field.related_model,
                                                  field_name=self.model_field.name)
        return None

    @property
    def lookup_key(self):
        related_field = self.model_field.get_related_field()
        lookup_key = None
        for field in self.model_field.related_model._meta.get_fields():
            if isinstance(field, models.ForeignKey):
                if field.remote_field.related_name == self.model_field.name:
                    lookup_key = f" {field.name}: {{ {related_field.name}: this.pk() }}"
        return lookup_key

    @property
    def name(self):
        return self.model_field.name

    @property
    def queryset_name(self):
        return model_queryset_name(model_cls=self.model_field.related_model)

    @property
    def lookups_type(self):
        return model_lookups_name(model_cls=self.model_field.related_model)

