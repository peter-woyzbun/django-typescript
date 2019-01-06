from django_typescript.model_types.view import ModelView, Response, status


# =================================
# Create Type View
# ---------------------------------

class CreateView(ModelView):

    REQUEST_METHOD = 'POST'

    def __init__(self, serializer_cls, permission_classes=None):
        ModelView.__init__(self, serializer_cls=serializer_cls, permission_classes=permission_classes,
                           url_path='create/')

    def _view_function(self):
        def create_view(request):
            serializer = self._get_serializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return create_view
