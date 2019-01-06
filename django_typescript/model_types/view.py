from django_typescript.core.views import View, Response, status
from django_typescript.core.types import ModelSerializerClass, ModelSerializer


# =================================
# Model View
# ---------------------------------

class ModelView(View):

    PK_PARAMETER = '<pk>'

    def __init__(self, serializer_cls: ModelSerializerClass, url_path: str, permission_classes=None):
        self.serializer_cls = serializer_cls
        View.__init__(self, url_path=url_path, permission_classes=permission_classes)

    def _get_serializer(self, *args, **kwargs) -> ModelSerializer:
        return self.serializer_cls(*args, **kwargs)

    @property
    def model_cls(self):
        return self.serializer_cls.Meta.model

