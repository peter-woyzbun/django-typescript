import typing
import json

from django.db import models
from django.core.paginator import Paginator
from rest_framework.request import Request

from django_typescript.core import types
from django_typescript.model_types.queryset_renderer import QuerysetRenderer


# =================================
# List Query
# ---------------------------------

class ListQuery(object):

    def __init__(self, request: Request, base_queryset: models.QuerySet, model_cls: typing.Type[models.Model]):
        self.request = request
        self.base_queryset = base_queryset
        self.model_cls = model_cls
        self.query_json = request.query_params.get('query')
        self.prefetch_json = request.query_params.get('prefetch')
        self.prefetch_trees: types.PrefetchTree = []
        self.query: dict = None
        self.order_on: typing.List[str] = request.query_params.get('order_on', [])
        self.fields: typing.List[str] = request.query_params.get('fields', None)
        self.page_num = request.query_params.get('page')
        self.page_size = request.query_params.get('pagesize', 25)
        self.num_results: int = None
        self.num_pages: int = None
        self._load_json()

    @property
    def is_paginated(self):
        return self.page_num is not None

    def _load_json(self):
        if self.query_json:
            query_json = self.query_json.replace(u'\ufeff', '')
            self.query = json.loads(query_json)
        if self.prefetch_json:
            self.prefetch_trees = json.loads(self.prefetch_json)
        if self.order_on:
            self.order_on = json.loads(self.order_on)

    def queryset(self) -> models.QuerySet:
        queryset = self.base_queryset
        if self.query:
            queryset_renderer = QuerysetRenderer(**self.query)
            queryset = queryset_renderer.apply_to_queryset(queryset=queryset)
        if self.order_on:
            queryset = queryset.order_by(*self.order_on)
        if self.is_paginated:
            paginator = Paginator(queryset, self.page_size)
            self.num_results = paginator.count
            self.num_pages = paginator.num_pages
            queryset = paginator.get_page(number=self.page_num)

        return queryset



