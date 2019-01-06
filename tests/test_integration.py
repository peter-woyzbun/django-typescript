import pathlib
import datetime

from rest_framework import serializers
from django.test import TestCase, override_settings

from django_typescript.test import IntegrationTestCase
from django_typescript import interface
from django_typescript.transpile import Transpiler

from .models import ThingSerializer, Thing, ThingChildSerializer, ThingChild


# =================================
# Setup
# ---------------------------------

TS_TRANSPILE_DEST = str(pathlib.Path(__file__).parent / 'ts' / 'src')


# =================================
# Interface
# ---------------------------------

class ThingType(interface.ModelType, model_cls=Thing):

    @interface.ModelType.method(a=serializers.CharField(), b=serializers.CharField())
    def thing_method(self: Thing, a, b):
        return {'a': a, 'b': b, 'id': self.pk}

    @interface.ModelType.static_method(a=serializers.CharField(), b=serializers.CharField())
    def thing_static_method(self, a, b):
        return {'a': a, 'b': b}


class ObjectTypeSerializer(serializers.Serializer):
    value = serializers.IntegerField()
    name = serializers.CharField()


class GenericObjectType(interface.ObjectType, serializer_cls=ObjectTypeSerializer):

    def __init__(self, value, name):
        self.value = value
        self.name = name

    @interface.ObjectType.method(add_value=serializers.IntegerField())
    def object_method(self, add_value):
        return {'total_value': self.value + add_value}

    @interface.ObjectType.method(a_datetime=serializers.DateTimeField())
    def object_method_w_arg_serializers(self, a_datetime):
        if not isinstance(a_datetime, datetime.datetime):
            raise Exception
        return {'dt': a_datetime}

    @classmethod
    @interface.ObjectType.static_method(a=serializers.CharField(), b=serializers.CharField())
    def object_static_method(cls, a, b):
        return {'a': a, 'b': b}


class Interface(interface.Interface):
    TRANSPILE_DEST = TS_TRANSPILE_DEST

    things = ThingType.as_type()
    child_things = interface.ModelType(model_cls=ThingChild)
    object_types = GenericObjectType


# =================================
# Tests
# ---------------------------------

urlpatterns = Interface.urlpatterns()


# =================================
# Tests
# ---------------------------------

class TestIntegration(IntegrationTestCase):

    TS_SERVER_SRC_PATH = TS_TRANSPILE_DEST

    @classmethod
    def setUpClass(cls):
        transpiler = Transpiler(interface=Interface)
        transpiler.transpile()
        IntegrationTestCase.setUpClass()

    @override_settings(ROOT_URLCONF=__name__)
    def test_create_and_get(self):
        self._run_ts_test(test_name='create_and_get')

    @override_settings(ROOT_URLCONF=__name__)
    def test_create_and_delete(self):
        self._run_ts_test(test_name='create_and_delete')

    @override_settings(ROOT_URLCONF=__name__)
    def test_update(self):
        self._run_ts_test(test_name='update')

    @override_settings(ROOT_URLCONF=__name__)
    def test_filter(self):
        self._run_ts_test(test_name='filter')

    @override_settings(ROOT_URLCONF=__name__)
    def test_filter_or(self):
        self._run_ts_test(test_name='filter_or')

    @override_settings(ROOT_URLCONF=__name__)
    def test_get_reverse_related(self):
        self._run_ts_test(test_name='get_reverse_related')

    @override_settings(ROOT_URLCONF=__name__)
    def test_filter_reverse_related(self):
        self._run_ts_test(test_name='filter_reverse_related')

    @override_settings(ROOT_URLCONF=__name__)
    def test_thing_method(self):
        self._run_ts_test(test_name='thing_method')

    @override_settings(ROOT_URLCONF=__name__)
    def test_thing_static_method(self):
        self._run_ts_test(test_name='thing_static_method')

    @override_settings(ROOT_URLCONF=__name__)
    def test_object_method(self):
        self._run_ts_test(test_name='object_method')








