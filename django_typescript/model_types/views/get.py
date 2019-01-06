from django_typescript.model_types.view import ModelView, Response, status


# =================================
# Get Type View
# ---------------------------------

class GetView(ModelView):

    REQUEST_METHOD = 'GET'

    def __init__(self, serializer_cls, permission_classes=None):
        ModelView.__init__(self, serializer_cls=serializer_cls, permission_classes=permission_classes,
                           url_path=f'{self.PK_PARAMETER}/get/')

    def _view_function(self):
        def get_view(request, pk):
            instance = self.model_cls.objects.get(pk=pk)
            serializer = self._get_serializer(instance, context={'request': request})
            return Response(serializer.data)
        return get_view
