import json

from rest_framework.request import Request

from django_typescript.core import endpoints
from django_typescript.model_types.view import ModelView, Response, status
from django_typescript.model_types.queryset import ModelTypeQuerysetBuilder, ModelTypeQuerysetPayloadBuilder
from django_typescript.core.utils.subset_serializer import subset_serializer


# =================================
# List Type View
# ---------------------------------

class ListView(ModelView):

    REQUEST_METHOD = 'GET'

    def __init__(self, serializer, serializer_cls, permission_classes=None):
        ModelView.__init__(self, serializer=serializer, serializer_cls=serializer_cls,
                           permission_classes=permission_classes, endpoint=endpoints.Endpoint())

    def _view_function(self):
        def list_view(request: Request):
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
            payload_builder = ModelTypeQuerysetPayloadBuilder.for_request(request=request, queryset=queryset)
            return Response(payload_builder.payload(serializer_cls=serializer_cls), status=status.HTTP_200_OK)

        return list_view
