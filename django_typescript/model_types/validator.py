from typing import Callable, Dict

from django_typescript.core import types
from django_typescript.core.utils.signature import Signature


# =================================
# Model Type Validator
# ---------------------------------

class ModelTypeValidator(object):

    def __init__(self, validate_func: Callable):
        self.validate_func = validate_func
        self.func_sig = Signature(callable_=validate_func)

    @property
    def validator_field_names(self):
        return self.func_sig.param_names

    def _prep_field_values(self, field_values: dict):
        for name in self.validator_field_names:
            if name not in field_values:
                field_values[name] = None

        return {k: v for k, v in field_values.items() if k in self.validator_field_names}

    def validate(self, **field_values):
        prepped_values = self._prep_field_values(field_values=field_values)
        return self.validate_func(**prepped_values)

