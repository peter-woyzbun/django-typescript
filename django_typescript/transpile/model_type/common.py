from django_typescript.core import types


# =================================
# Constants
# ---------------------------------

QUERYSET_SUFFIX = 'QuerySet'
QUERYSET_LOOKUPS_SUFFIX = QUERYSET_SUFFIX + 'Lookups'
FOREIGN_KEY_DECORATOR_NAME = 'foreignKeyField'
DATETIME_FIELD_DECORATOR_NAME = 'dateTimeField'
TYPESCRIPT_THIS_PK_REF = '${this.pk()}'
TYPESCRIPT_ARG_PK_REF = '${primaryKey}'
FIELDS_INTERFACE_SUFFIX = 'Fields'
PREFETCH_KEY_TYPE_SUFFIX = 'PrefetchKey'
PROPERTY_PREFETCH_KEY_TYPE_SUFFIX = 'PropertyPrefetchKey'


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


def model_property_prefetch_type_name(model_cls: types.ModelClass):
    return model_cls.__name__ + PROPERTY_PREFETCH_KEY_TYPE_SUFFIX


def forward_relation_getter_setter(related_model: types.ModelClass, field_name: str):
    """
    Forward relation fields have a special model declaration. It is a
    decorated parameter for handling logic for fetching the relation.

    """
    rel_model_name = related_model.__name__
    return f"@{FOREIGN_KEY_DECORATOR_NAME}(() => {rel_model_name}) {field_name}?: {rel_model_name}"


def datetime_getter_setter(field_name):
    return f"@{DATETIME_FIELD_DECORATOR_NAME}() {field_name}?: Date"

