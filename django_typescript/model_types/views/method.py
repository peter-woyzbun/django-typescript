from typing import Callable, Type

from rest_framework import serializers

from django_typescript.core import endpoints
from django_typescript.core.views import MethodViewBase, Response, status
from django_typescript.core.utils import underscore_to_dash


# =================================
# Model Method View
# ---------------------------------

class ModelMethodView(MethodViewBase):

    REQUEST_METHOD = 'POST'

    def __init__(self, func: Callable, model_serializer_cls: Type[serializers.ModelSerializer]=None,
                 arg_serializer_cls: Type[serializers.Serializer]=None, permission_classes=None,
                 **serializer_fields: serializers.Field):
        """

        Parameters
        ----------
        func : The function that executes the logic for this ModelMethodView.
        model_serializer_cls : The `rest_framework` `ModelSerializer` class used to serialize instances of this
            ModelMethodView's model.
        arg_serializer_cls : The `rest_framework` serializer class used to serialize arguments for the `func`
            of this ModelMethodView.
        permission_classes : Optional permission classes to apply to view function.
        """
        self.model_serializer_cls = model_serializer_cls
        MethodViewBase.__init__(self, func=func, arg_serializer_cls=arg_serializer_cls,
                                permission_classes=permission_classes,
                                endpoint=endpoints.Endpoint(underscore_to_dash(func.__name__), endpoints.Param),
                                **serializer_fields)

    @property
    def name(self):
        return self.func.__name__

    def _view_function(self):
        def method_view_func(request, pk):
            obj = self.model_serializer_cls.Meta.model.objects.get(pk=pk)
            args = request.data
            args = self._args_to_internal_value(args)
            output = self.func(obj, **args)
            # If the function returns a Response instance, just return that.
            if isinstance(output, Response):
                return output
            return Response(output, status=status.HTTP_200_OK)
        return method_view_func

