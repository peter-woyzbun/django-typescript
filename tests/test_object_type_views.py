import json
import datetime

from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.exceptions import PermissionDenied
from rest_framework.test import APIClient
from rest_framework import permissions
from rest_framework import status, serializers


from django_typescript import interface


# =================================
# Interface
# ---------------------------------

class ObjectTypeSerializer(serializers.Serializer):
    timestamp = serializers.DateTimeField()
    name = serializers.CharField()


class DenyPermission(permissions.BasePermission):

    def has_permission(self, request, view):
        return False

    def has_object_permission(self, request, view, obj):
        return False


class GenericObjectType(interface.ObjectType, serializer_cls=ObjectTypeSerializer):

    def __init__(self, timestamp, name):
        self.timestamp = timestamp
        self.name = name

    @interface.ObjectType.method()
    def object_method(self, delta_hours):
        if not isinstance(self.timestamp, datetime.datetime):
            raise Exception
        return {'dt': self.timestamp + datetime.timedelta(hours=delta_hours)}

    @interface.ObjectType.method(a_datetime=serializers.DateTimeField())
    def object_method_w_arg_serializers(self, a_datetime):
        if not isinstance(a_datetime, datetime.datetime):
            raise Exception
        return {'dt': a_datetime}

    @interface.ObjectType.method(permission_classes=(DenyPermission, ))
    def object_method_no_permission(self):
        return {}

    @interface.ObjectType.static_method()
    def object_static_method(cls, a, b):
        return {'a': a, 'b': b}

    @interface.ObjectType.static_method(permission_classes=[DenyPermission])
    def object_static_method_no_permission(cls, a, b):
        return {'a': a, 'b': b}


class Interface(interface.Interface):
    object_types = GenericObjectType


urlpatterns = Interface.urlpatterns()


# =================================
# Tests
# ---------------------------------

# Override settings to load urlpatterns from this module (defined above).
@override_settings(ROOT_URLCONF=__name__)
class TestModelTypeViews(TestCase):

    client: APIClient

    def setUp(self):
        self.client = APIClient()

    def test_object_method(self):
        data = {
            '__init__': {'timestamp': str(datetime.datetime.now()), 'name': 'test_object'},
            '__args__': {'delta_hours': 5}
        }
        view_url = reverse('generic_object_type:object_method')
        response = self.client.post(view_url, data=data, format='json')
        self.assertTrue('dt' in response.data)

    def test_object_method_no_permission(self):
        view_url = reverse('generic_object_type:object_method_no_permission')
        response = self.client.post(view_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_object_method_arg_serializer_kwargs(self):
        data = {
            '__init__': {'timestamp': str(datetime.datetime.now()), 'name': 'test_object'},
            '__args__': {'a_datetime': str(datetime.datetime.now())}
        }
        view_url = reverse('generic_object_type:object_method_w_arg_serializers')
        response = self.client.post(view_url, data=data, format='json')
        self.assertTrue('dt' in response.data)

    def test_object_static_method(self):
        data = {'a': 'test_a', 'b': 'test_b'}
        view_url = reverse('generic_object_type:object_static_method')
        response = self.client.post(view_url, data=data, format='json')
        self.assertEqual(response.data['a'], 'test_a')
        self.assertEqual(response.data['b'], 'test_b')

    def test_object_static_method_permissions(self):
        data = {'a': 'test_a', 'b': 'test_b'}
        view_url = reverse('generic_object_type:object_static_method_no_permission')
        response = self.client.post(view_url, data=data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)