from typing import Callable, Dict

from django_typescript.core.utils.signature import Signature
from django_typescript.model_types.field import ModelTypeField


# =================================
# Model Type Validator
# ---------------------------------

class ModelTypeValidator(object):

    def __init__(self, validate_func: Callable, forward_relation_fields: Dict[str, ModelTypeField]):
        self.validate_func = validate_func
        self.func_sig = Signature(callable_=validate_func)
        self.forward_relation_fields = forward_relation_fields

    @property
    def validator_field_names(self):
        return self.func_sig.param_names

    def _resolve_forward_relations(self, field_values: dict):
        resolved_field_values = {}
        for field_name, value in field_values.items():

            if field_name in self.forward_relation_fields:
                forward_relation_field = self.forward_relation_fields[field_name]
                pk_value = field_values[field_name]
                resolved_field_values[forward_relation_field.model_field.name] = forward_relation_field.model_field.related_model.objects.get(pk=pk_value)
            else:
                if field_name in self.validator_field_names:
                    resolved_field_values[field_name] = value
        return resolved_field_values

    def validate(self, **field_values):
        resolved_field_values = self._resolve_forward_relations(field_values)
        return self.validate_func(**resolved_field_values)