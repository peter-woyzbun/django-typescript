from typing import Callable, Dict

from django_typescript.core import types
from django_typescript.core.utils.signature import Signature


# =================================
# Model Type Validator
# ---------------------------------

class ModelTypeValidator(object):

    def __init__(self, validate_func: Callable, forward_rel_model_fields: Dict[str, types.ModelField]):
        self.validate_func = validate_func
        self.func_sig = Signature(callable_=validate_func)
        self.forward_rel_model_fields = forward_rel_model_fields

    @property
    def validator_field_names(self):
        return self.func_sig.param_names

    def _resolve_forward_relations(self, field_values: dict):
        resolved_field_values = {}
        print(self.forward_rel_model_fields)
        # for resolved_key, model_field in self.forward_rel_model_fields.items():
        #     if model_field.get_attname() in field_values:
        #         if model_field.name in self.func_sig:
        #             pk_value = field_values.get(model_field.get_attname())
        #             if pk_value is not None:
        #                 resolved_field_values[resolved_key] = model_field.related_model.objects.get(pk=pk_value)
        #             resolved_field_values.pop(model_field.get_attname())
        #

        for field_name, value in field_values.items():

            if field_name in self.forward_rel_model_fields:
                model_field = self.forward_rel_model_fields[field_name]
                pk_value = field_values[model_field.get_attname()]
                resolved_field_values[model_field.name] = model_field.related_model.objects.get(pk=pk_value)
            else:
                if field_name in self.validator_field_names:
                    resolved_field_values[field_name] = value
        return resolved_field_values

    def validate(self, **field_values):
        resolved_field_values = self._resolve_forward_relations(field_values)
        return self.validate_func(**resolved_field_values)