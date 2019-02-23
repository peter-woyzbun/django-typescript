import json

from django.db import models

from django_typescript.core import endpoints
from django_typescript.model_types.view import ModelView, Response, status
from django_typescript.model_types.queryset import ModelTypeQuerysetBuilder, ModelTypeQuerysetPayloadBuilder


# =================================
# Get Type View
# ---------------------------------

class GetView(ModelView):

    REQUEST_METHOD = 'GET'

    def __init__(self, serializer, serializer_cls, permission_classes=None):
        ModelView.__init__(self, serializer=serializer, serializer_cls=serializer_cls,
                           permission_classes=permission_classes,
                           endpoint=endpoints.Endpoint(endpoints.Param, 'get'))

    def _view_function(self):
        def get_view(request, pk):
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
        return get_view
