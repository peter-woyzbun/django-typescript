from django_typescript.core import endpoints
from django_typescript.model_types.view import ModelView, Response, status
from django_typescript.model_types.queryset import ModelTypeQuerysetBuilder, ModelTypeQuerysetPayloadBuilder


# =================================
# Get or Create Type View
# ---------------------------------

class GetOrCreateView(ModelView):

    REQUEST_METHOD = 'POST'

    def __init__(self, serializer, serializer_cls, permission_classes=None):
        ModelView.__init__(self, serializer=serializer, serializer_cls=serializer_cls, permission_classes=permission_classes,
                           endpoint=endpoints.Endpoint('get-or-create'))

    def _view_function(self):

        def get_or_create_view(request):
            lookup = request.data['lookup']
            defaults = request.data['defaults']
            serializer = self._get_serializer(data={**lookup, **defaults}, context={'request': request})
            serializer.is_valid(raise_exception=True)
            instance, created = self.model_cls.objects.get_or_create(**lookup, defaults=defaults)
            serializer = self._get_serializer(instance, context={'request': request})
            if created:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
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
            queryset = queryset.get(pk=instance.pk)
            payload_builder = ModelTypeQuerysetPayloadBuilder.for_request(request=request, queryset=queryset,
                                                                          many=False)
            return Response(payload_builder.payload(serializer_cls=serializer_cls))
        return get_or_create_view
