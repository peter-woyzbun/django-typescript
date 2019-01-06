from typing import Type

from rest_framework import serializers


# =================================
# Interface Type
# ---------------------------------

class InterfaceType(object):

    @classmethod
    def urlpatterns(cls):
        raise NotImplementedError

    def urlpatterns(self):
        raise NotImplementedError

    def base_url(self):
        raise NotImplementedError
