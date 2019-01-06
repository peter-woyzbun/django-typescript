from typing import Callable, Type

from rest_framework import serializers

from django_typescript.core.views.view import View
from django_typescript.core.utils.signature import Signature


# =================================
# Method View Base
# ---------------------------------

class MethodViewBase(View):

    def __init__(self, func: Callable, url_path: str, permission_classes=None,
                 arg_serializer_cls: Type[serializers.Serializer]=None, **serializer_fields: serializers.Field):
        """

        Parameters
        ----------
        func: Function associated with this method view - called when
            this view receives a request.
        url_path: The url path of this method view.
        permission_classes: Optional tuple of permission classes.
        arg_serializer_cls: Optional serializer class for serializing
            arguments contained in the Request that will be passed to the
            function.
        serializer_fields: Optional mapping of function argument names to
            field serializers. Used to create a serializer class on the fly.
        """
        self.func = func
        self.func_sig = Signature(callable_=func)
        self._arg_serializer_cls = arg_serializer_cls
        self.serializer_fields = serializer_fields
        View.__init__(self, url_path=url_path, permission_classes=permission_classes)

        self._validate_serializer_cls()

    def _validate_serializer_cls(self):
        arg_serializer_cls = self.arg_serializer_cls
        if arg_serializer_cls is not None:
            arg_serializer = arg_serializer_cls()
            field_names = arg_serializer.fields.keys()
            invalid_names = set(field_names) - set(self.func_sig.param_names)
            if invalid_names:
                raise AssertionError(f"Serializer class has one or more fields - `{invalid_names}` - whose names"
                                     f"do not correspond to any argument of the function signature.")

    @property
    def arg_serializer_cls(self):
        if self._arg_serializer_cls:
            return self._arg_serializer_cls
        if self.serializer_fields:
            class_dict = {
                **self.serializer_fields,
                'Meta': type("Meta", (object, ), {'fields': '__all__'})
            }
            arg_serializer_cls = type("ArgSerializer", (serializers.Serializer,), class_dict)
            return arg_serializer_cls
        return None

    def _args_to_internal_value(self, arg_data: dict) -> dict:
        arg_serializer_cls = self.arg_serializer_cls
        if arg_serializer_cls is None:
            return arg_data
        arg_serializer = arg_serializer_cls(data=arg_data)
        arg_serializer.is_valid(raise_exception=True)
        return arg_serializer.to_internal_value(data=arg_data)
