import typing
import json
from functools import reduce
import operator

from django.db import models
from django.core.paginator import Paginator
from rest_framework.request import Request

from django_typescript.core import types
from django_typescript.core.utils.subset_serializer import subset_serializer


# =================================
# Model Type Query
# ---------------------------------

class ModelTypeQuery(object):

    """
    Helper class for applying list view queries. These queries will be sent by
    `<ModelName>QuerySet` TypeScript class instances. The query structure is
    essentially a simple boolean algebra.

    """

    def __init__(self, filters: dict, exclude: dict, or_: list):
        """

        Parameters
        ----------
        filters :
            A dictionary containing key-values that should be valid keyword arguments
            for Django `QuerySet`'s `.filter()` method. E.g this should work:

                `queryset.filter(**filters)`

        exclude :
            A dictionary containing key-values that should be valid keyword arguments
            for Django `QuerySet`'s `.exclude()` method. E.g this should work:

                `queryset.exclude(**exclude)`
        or_ :
            An optional list whose values are the same as described here - recursive. They are
            to be used to create union of queries.
        """
        self.filters = filters
        self.exclude = exclude
        self.or_ = or_
        self.children: typing.List['ModelTypeQuery'] = list()

        self._make_children()

    @property
    def n_children(self):
        return len(self.children)

    def _make_children(self):
        for data in self.or_:
            self.children.append(ModelTypeQuery(**data))

    def _q(self) -> models.Q:
        filter_q = models.Q(**self.filters)
        if not self.exclude:
            return filter_q
        return filter_q & ~models.Q(**self.exclude)

    def apply_to_queryset(self, queryset: models.QuerySet, use_q=False):
        if self.n_children == 0:
            if not use_q:
                queryset = queryset.filter(**self.filters)
                if self.exclude:
                    queryset = queryset.exclude(**self.exclude)
                return queryset
            return self._q()
        if use_q:
            return self._q()
        queries = [self._q()] + [c.apply_to_queryset(queryset=queryset, use_q=True) for c in self.children]
        return queryset.filter(reduce(operator.or_, queries))


# =================================
# Model Type Queryset Builder
# ---------------------------------

class ModelTypeQuerysetBuilder(object):

    """
    Class for 'building' querysets based on Request query parameters.

    """

    QUERY_KEY = 'query'
    PREFETCH_KEY = 'prefetch'
    ORDER_ON_KEY = 'order_on'

    def __init__(self, query: ModelTypeQuery=None, order_on: typing.List[str]=None,
                 prefetch_trees: typing.List[types.PrefetchTree]= None):
        self.query = query
        self.order_on = order_on
        self.prefetch_trees = prefetch_trees

    @classmethod
    def for_request(cls, request: Request) -> 'ModelTypeQuerysetBuilder':
        kwargs = {}
        if cls.QUERY_KEY in request.query_params:
            kwargs['query'] = ModelTypeQuery(**json.loads(request.query_params[cls.QUERY_KEY]))
        if cls.ORDER_ON_KEY in request.query_params:
            kwargs['order_on'] = json.loads(request.query_params[cls.ORDER_ON_KEY])
        if cls.PREFETCH_KEY in request.query_params:
            kwargs['prefetch_trees'] = json.loads(request.query_params[cls.PREFETCH_KEY])
        return cls(**kwargs)

    def _flatten_prefetch_tree(self, prefetch_tree: types.PrefetchTree):
        """
        Return a prefetch tree in 'flattened' form, e.g:

            `{'parent': {'grand_parent'}}` -> `parent__grand_parent`

        """

        if isinstance(prefetch_tree, str):
            return prefetch_tree
        else:
            return list(prefetch_tree.keys())[0] + "__" + self._flatten_prefetch_tree(list(prefetch_tree.values())[0])

    def build_queryset(self, queryset: models.QuerySet) -> models.QuerySet:
        if self.query:
            queryset = self.query.apply_to_queryset(queryset)
        if self.order_on:
            queryset = queryset.order_by(*self.order_on)
        if self.prefetch_trees:
            queryset = queryset.select_related(
                *[self._flatten_prefetch_tree(prefetch_tree) for prefetch_tree in self.prefetch_trees]
            )
        return queryset


# =================================
# Model Type Queryset Payload Builder
# ---------------------------------

class ModelTypeQuerysetPayloadBuilder(object):

    PAGE_NUM_KEY = 'page'
    PAGE_SIZE_KEY = 'pagesize'
    DEFAULT_PAGE_SIZE = 25
    FIELDS_KEY = 'fields'
    EXISTS_KEY = 'exists'

    def __init__(self, queryset: models.QuerySet, fields: typing.List[str] = None, page_num: int = None,
                 page_size: int = None, exists: bool = False, many=True):
        self.queryset = queryset
        self.fields = fields
        self.page_num = page_num
        self.page_size = page_size
        self.exists = exists
        self.many = many

    @property
    def is_paginated(self):
        return self.page_num is not None

    @classmethod
    def for_request(cls, request: Request, queryset: models.QuerySet, many=True) -> 'ModelTypeQuerysetPayloadBuilder':
        kwargs = {
            'page_num': request.query_params.get(cls.PAGE_NUM_KEY),
            'page_size': request.query_params.get(cls.PAGE_SIZE_KEY, cls.DEFAULT_PAGE_SIZE)
        }
        if cls.FIELDS_KEY in request.query_params:
            kwargs['fields'] = json.loads(request.query_params[cls.FIELDS_KEY])
        if cls.EXISTS_KEY in request.query_params:
            kwargs['exists'] = json.loads(request.query_params[cls.EXISTS_KEY])
        return cls(queryset=queryset, many=many, **kwargs)

    def paginated_payload(self, serializer_cls: types.ModelSerializerClass):
        assert self.is_paginated, 'Payload is not paginated.'
        queryset = self.queryset
        if self.fields:
            queryset = queryset.values(*self.fields)
            serializer_cls = subset_serializer(serializer_cls=serializer_cls, select_fields=self.fields)
        paginator = Paginator(queryset, self.page_size)
        queryset = paginator.get_page(number=self.page_num)
        serializer = serializer_cls(queryset, many=self.many)
        return {
            'num_results': paginator.count,
            'num_pages': paginator.num_pages,
            'page': self.page_num,
            'data': serializer.data
        }

    def exists_payload(self):
        assert self.exists, 'Payload is not existence check.'
        return self.queryset.exists()

    def payload(self, serializer_cls: types.ModelSerializerClass):
        if self.fields:
            serializer_cls = subset_serializer(serializer_cls=serializer_cls, select_fields=self.fields)
        if self.is_paginated:
            return self.paginated_payload(serializer_cls=serializer_cls)
        if self.exists:
            return self.queryset.exists()
        queryset = self.queryset
        if self.fields:
            queryset = queryset.values(*self.fields)
        serializer = serializer_cls(queryset, many=self.many)
        return serializer.data










