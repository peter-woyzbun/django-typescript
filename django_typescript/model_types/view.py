from typing import List

from django_typescript.core import endpoints
from django_typescript.core.views import View, Response, status
from django_typescript.core import types
from django_typescript.model_types.serializer import ModelTypeSerializer


# =================================
# Model View
# ---------------------------------

class ModelView(View):

    def __init__(self, serializer: ModelTypeSerializer, serializer_cls: types.ModelSerializerClass,
                 endpoint: endpoints.Endpoint, permission_classes=None):
        self.serializer = serializer
        self.serializer_cls = serializer_cls
        View.__init__(self, endpoint=endpoint, permission_classes=permission_classes)

    def _get_serializer(self, *args, prefetch_trees: List[types.PrefetchTree] = None,
                        **kwargs) -> types.ModelSerializer:
        if not prefetch_trees:
            return self.serializer_cls(*args, **kwargs)
        else:
            serializer_cls = self.serializer.build_prefetch_serializer_tree(prefetch_trees=prefetch_trees)
            return serializer_cls(*args, **kwargs)

    @property
    def model_cls(self):
        return self.serializer_cls.Meta.model

