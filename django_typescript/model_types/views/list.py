import json

from rest_framework.request import Request

from django_typescript.core import endpoints
from django_typescript.model_types.view import ModelView, Response, status
from django_typescript.model_types.prefetch import prefetch_select_related
from django_typescript.model_types.list_query import ListQuery
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
            fields_json = request.query_params.get('fields')
            queryset = self.model_cls.objects.all()
            prefetch_trees = None
            prefetch_json = request.query_params.get('prefetch')
            if prefetch_json:
                prefetch_trees = json.loads(prefetch_json)
            if prefetch_trees:
                queryset = queryset.select_related(
                    *[prefetch_select_related(prefetch_tree) for prefetch_tree in prefetch_trees])
            list_query = ListQuery(model_cls=self.model_cls, base_queryset=queryset, request=request)
            queryset = list_query.queryset()

            serializer = self._get_serializer(queryset, prefetch_trees=prefetch_trees, many=True,
                                              context={'request': request})
            if fields_json:
                fields = json.loads(fields_json)
                if len(fields) > 0:
                    serializer_cls = subset_serializer(select_fields=fields, serializer_cls=self.serializer_cls)
                    serializer = serializer_cls(queryset, many=True, context={'request': request})

            else:
                serializer = self._get_serializer(queryset, prefetch_trees=prefetch_trees, many=True,
                                                  context={'request': request})
            list_data = serializer.data
            if list_query.is_paginated:
                return Response({
                    'num_results': list_query.num_results,
                    'num_pages': list_query.num_pages,
                    'page': list_query.page_num,
                    'data': list_data
                })
            return Response(list_data, status=status.HTTP_200_OK)

        return list_view
