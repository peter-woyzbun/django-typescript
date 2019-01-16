from typing import List

from django_typescript.core import types


# =================================
# Field Info
# ---------------------------------

class FieldInfo(object):

    def __init__(self, serializer_field_name: str, model_field: types.ModelField, serializer: types.FieldSerializer):
        self.serializer_field_name = serializer_field_name
        self.model_field = model_field
        self.serializer = serializer

    @property
    def is_forward_relation(self):
        return types.field_is_forward_relation(self.model_field)

    @property
    def is_pk(self):
        return self.model_field.primary_key

    @staticmethod
    def _lookup_key(*parts: str):
        return "__".join(parts)

    def lookup_info(self, model_pool: types.ModelPool) -> List[types.FieldLookupInfo]:
        lookup_info = []
        if not self.is_forward_relation:
            lookup_info.append((self.serializer_field_name, self.model_field, None))
            for lookup_str, lookup_cls in self.model_field.get_lookups().items():
                lookup_info.append(
                    (self._lookup_key(*([self.serializer_field_name] + [lookup_str])), self.model_field, lookup_cls)
                )
        else:
            if self.model_field.related_model in model_pool:
                lookup_info.append((self.model_field.name, self.model_field.related_model, None))
        return lookup_info

