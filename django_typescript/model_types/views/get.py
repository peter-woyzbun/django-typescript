import json

from django.db import models

from django_typescript.core import endpoints
from django_typescript.model_types.prefetch import prefetch_select_related
from django_typescript.model_types.view import ModelView, Response, status


# =================================
# Get Type View
# ---------------------------------

class GetView(ModelView):

    REQUEST_METHOD = 'GET'

    def __init__(self, serializer, serializer_cls, permission_classes=None):
        ModelView.__init__(self, serializer=serializer, serializer_cls=serializer_cls,
                           permission_classes=permission_classes,
                           endpoint=endpoints.Endpoint(endpoints.Param, 'get'))

    def _base_queryset(self, request) -> models.QuerySet:
        prefetch_trees = None
        prefetch_json = request.query_params.get('prefetch')
        if prefetch_json:
            prefetch_trees = json.loads(prefetch_json)
        queryset = self.model_cls.objects
        if prefetch_trees:
            queryset = queryset.select_related(
                *[prefetch_select_related(prefetch_tree) for prefetch_tree in prefetch_trees])
        return queryset

    def _view_function(self):
        def get_view(request, pk):
            prefetch_trees = None
            prefetch_json = request.query_params.get('prefetch')
            if prefetch_json:
                prefetch_trees = json.loads(prefetch_json)
            queryset = self.model_cls.objects
            if prefetch_trees:
                queryset = queryset.select_related(*[prefetch_select_related(prefetch_tree) for prefetch_tree in prefetch_trees])
            instance = queryset.get(pk=pk)

            serializer = self._get_serializer(instance, prefetch_trees=prefetch_trees, context={'request': request})
            return Response(serializer.data)
        return get_view
