from django_typescript.model_types.view import ModelView, Response, status


# =================================
# Update Type View
# ---------------------------------

class UpdateView(ModelView):

    REQUEST_METHOD = 'POST'

    def __init__(self, serializer_cls, permission_classes=None):
        ModelView.__init__(self, serializer_cls=serializer_cls, permission_classes=permission_classes,
                           url_path=f'{self.PK_PARAMETER}/update/')

    @property
    def model_cls(self):
        return self.serializer_cls.Meta.model

    def _view_function(self):

        def update_view(request, pk):
            instance = self.model_cls.objects.get(pk=pk)
            serializer = self._get_serializer(data=request.data, context={'request': request}, partial=True,
                                              instance=instance)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return update_view
