from typing import Callable, Type

from rest_framework import serializers

from django_typescript.core.views import MethodViewBase, Response, status
from django_typescript.core.utils import underscore_to_dash


# =================================
# Object Static Method View
# ---------------------------------

class ObjectStaticMethodView(MethodViewBase):

    REQUEST_METHOD = 'POST'

    def __init__(self, func: Callable, arg_serializer_cls: Type[serializers.Serializer]=None, permission_classes=None,
                 **serializer_fields: serializers.Field):
        """

        Parameters
        ----------
        func : The function that executes the logic for this ModelMethodView.
        object_serializer_cls :
        arg_serializer_cls : The `rest_framework` serializer class used to serialize arguments for the `func`
            of this ModelMethodView.
        permission_classes : Optional permission classes to apply to view function.
        """
        self.object_type_class: Type = None
        MethodViewBase.__init__(self, func=func, arg_serializer_cls=arg_serializer_cls,
                                permission_classes=permission_classes,
                                url_path=f'{underscore_to_dash(func.__name__)}/',
                                **serializer_fields)

    @property
    def name(self):
        return self.func.__name__

    def _view_function(self):
        if self.object_type_class is None:
            raise AssertionError("Cannot create ModelStaticMethodView view function without `object_type_class` "
                                 "defined.")
        def static_method_view_func(request):
            arg_data = request.data
            arg_data = self._args_to_internal_value(arg_data=arg_data)
            output = self.func(self.object_type_class, **arg_data)
            if isinstance(output, Response):
                return output
            return Response(output, status=status.HTTP_200_OK)
        return static_method_view_func

