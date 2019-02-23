from django_typescript.core import endpoints
from django_typescript.core.views.view import View, Response, status
from django_typescript.core.utils import underscore_to_dash


# =================================
# Model Property View
# ---------------------------------

class ModelPropertyView(View):

    REQUEST_METHOD = 'GET'

    def __init__(self, property_name: str, model_cls, permission_classes=None):
        self.model_cls = model_cls
        self.property_name = property_name
        View.__init__(self, permission_classes=permission_classes,
                      endpoint=endpoints.Endpoint(endpoints.Param, underscore_to_dash(property_name)))

    @property
    def name(self):
        return self.property_name

    def _view_function(self):
        def property_view_func(request, pk):
            obj = self.model_cls.objects.get(pk=pk)
            output = getattr(obj, self.property_name)
            # If the function returns a Response instance, just return that.
            if isinstance(output, Response):
                return output
            return Response(output, status=status.HTTP_200_OK)
        return property_view_func

