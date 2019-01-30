from typing import Callable, Type

from rest_framework import serializers

from django_typescript.core import endpoints
from django_typescript.core.views import MethodViewBase, Response, status, MethodMeta
from django_typescript.core.utils import underscore_to_dash


# =================================
# Method Type View
# ---------------------------------

class ModelStaticMethodView(MethodViewBase):

    REQUEST_METHOD = 'POST'

    def __init__(self, func: Callable, arg_serializer_cls: Type[serializers.Serializer]=None, permission_classes=None,
                 **serializer_fields: serializers.Field):
        self.model_type_cls = None
        MethodViewBase.__init__(self, func=func, arg_serializer_cls=arg_serializer_cls,
                                permission_classes=permission_classes,
                                endpoint=endpoints.Endpoint(underscore_to_dash(func.__name__)),
                                **serializer_fields)

    @property
    def name(self):
        return self.func.__name__

    def _view_function(self):

        def static_method_view_func(request):
            meta = MethodMeta(request=request)
            args = request.data
            args = self._args_to_internal_value(args)
            output = self.func(meta, **args)
            if isinstance(output, Response):
                return output
            return Response(output, status=status.HTTP_200_OK)
        return static_method_view_func
