from django_typescript.core import endpoints
from django_typescript.model_types.view import ModelView, Response, status


# =================================
# Delete Type View
# ---------------------------------

class DeleteView(ModelView):

    REQUEST_METHOD = 'DELETE'

    def __init__(self, serializer, serializer_cls, permission_classes=None):
        ModelView.__init__(self, serializer=serializer, serializer_cls=serializer_cls,
                           permission_classes=permission_classes,
                           endpoint=endpoints.Endpoint(endpoints.Param, 'delete'))

    def _view_function(self):

        def delete_view(request, pk):
            instance = self.model_cls.objects.get(pk=pk)
            instance.delete()
            return Response({}, status=status.HTTP_200_OK)

        return delete_view
