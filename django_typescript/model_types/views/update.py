from django_typescript.core import endpoints
from django_typescript.model_types.view import ModelView, Response, status
from django_typescript.model_types.queryset import ModelTypeQuerysetBuilder, ModelTypeQuerysetPayloadBuilder


# =================================
# Update Type View
# ---------------------------------

class UpdateView(ModelView):

    REQUEST_METHOD = 'POST'

    def __init__(self, serializer, serializer_cls, permission_classes=None):
        ModelView.__init__(self, serializer=serializer, serializer_cls=serializer_cls,
                           permission_classes=permission_classes,
                           endpoint=endpoints.Endpoint(endpoints.Param, 'update'))

    @property
    def model_cls(self):
        return self.serializer_cls.Meta.model

    def _view_function(self):

        def _update_view(request, pk):
            instance = self.model_cls.objects.get(pk=pk)
            serializer = self._get_serializer(data=request.data, context={'request': request}, partial=True,
                                              instance=instance)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response(serializer.data, status=status.HTTP_200_OK)

        def update_view(request, pk):
            instance = self.model_cls.objects.get(pk=pk)
            serializer = self._get_serializer(data=request.data, context={'request': request}, partial=True,
                                              instance=instance)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            queryset = self.model_cls.objects.all()
            queryset_builder = ModelTypeQuerysetBuilder.for_request(request=request,
                                                                    model_cls=self.serializer_cls.Meta.model)
            queryset = queryset_builder.build_queryset(queryset=queryset)
            if queryset_builder.prefetch_trees:
                serializer_cls = self.serializer.build_prefetch_serializer_tree(
                    prefetch_trees=queryset_builder.prefetch_trees
                )
            else:
                serializer_cls = self.serializer_cls
            queryset = queryset.get(pk=pk)
            payload_builder = ModelTypeQuerysetPayloadBuilder.for_request(request=request, queryset=queryset,
                                                                          many=False)
            return Response(payload_builder.payload(serializer_cls=serializer_cls))

        return update_view
