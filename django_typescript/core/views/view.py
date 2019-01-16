from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django_typescript.core.types import PermissionClasses
from django_typescript.core import endpoints


# =================================
# View
# ---------------------------------

class View(object):

    REQUEST_METHOD: str = None

    def __init__(self, endpoint: endpoints.Endpoint, permission_classes: PermissionClasses = None):
        self.endpoint = endpoint
        self.permission_classes = permission_classes

    def _view_function(self):
        raise NotImplementedError

    def view(self):
        view_func = self._view_function()
        if self.permission_classes:
            view_func.permission_classes = self.permission_classes
        view = api_view([self.REQUEST_METHOD])(view_func)
        return view

