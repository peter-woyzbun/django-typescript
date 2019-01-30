from typing import Callable, Type

from rest_framework import serializers

from django_typescript.core import endpoints
from django_typescript.core.views import MethodViewBase, Response, status
from django_typescript.core.utils import underscore_to_dash


# =================================
# Object Method View
# ---------------------------------

class ObjectMethodView(MethodViewBase):

    REQUEST_METHOD = 'POST'

    def __init__(self, func: Callable, object_serializer_cls: Type[serializers.ModelSerializer]=None,
                 arg_serializer_cls: Type[serializers.Serializer]=None, permission_classes=None,
                 **serializer_fields: serializers.Field):
        """

        Parameters
        ----------
        func : The function that executes the logic for this ModelMethodView.
        object_serializer_cls : The `rest_framework` `ModelSerializer` class used to serialize instances of this
            ModelMethodView's model.
        arg_serializer_cls : The `rest_framework` serializer class used to serialize arguments for the `func`
            of this ModelMethodView.
        permission_classes : Optional permission classes to apply to view function.
        """
        self.object_serializer_cls = object_serializer_cls
        self.object_type_class: Type = None
        MethodViewBase.__init__(self, func=func, arg_serializer_cls=arg_serializer_cls,
                                permission_classes=permission_classes,
                                endpoint=endpoints.Endpoint(underscore_to_dash(func.__name__)),
                                **serializer_fields)

    @property
    def name(self):
        return self.func.__name__

    def _view_function(self):
        if self.object_type_class is None:
            raise AssertionError("Cannot create ModelStaticMethodView view function without `object_type_class` "
                                 "defined.")

        def method_view_func(request):
            # Request data that will be passed to this `ObjectMethodView`'s `obj_cls`
            # for initialization of a class instance.
            init_data = request.data.get('__init__')
            print(init_data)
            obj_serializer = self.object_serializer_cls(data=init_data)
            obj_serializer.is_valid(raise_exception=True)
            # Create object instance from serialized data.
            obj = self.object_type_class(**obj_serializer.to_internal_value(init_data))
            arg_data = request.data.get('__args__', {})
            arg_data = self._args_to_internal_value(arg_data=arg_data)

            output = self.func(obj, **arg_data)
            if isinstance(output, Response):
                return output
            return Response(output, status=status.HTTP_200_OK)
        return method_view_func

