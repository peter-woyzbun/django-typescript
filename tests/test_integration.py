import pathlib
import datetime

from rest_framework import serializers
from django.test import TestCase, override_settings

from django_typescript.test import IntegrationTestCase
from django_typescript import interface
from django_typescript.transpile import Transpiler

from .models import Thing, ThingChild, ThingChildChild, ThingOneToOneTarget, TimestampedModel


# =================================
# Setup
# ---------------------------------

TS_TRANSPILE_DEST = str(pathlib.Path(__file__).parent / 'ts' / 'src')


# =================================
# Interface
# ---------------------------------

class ThingType(interface.ModelType, model_cls=Thing):

    def validate(self, name):
        if name == 'invalid_name':
            raise interface.ValidationError({'name': 'Invalid name'})

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

    @interface.ObjectType.static_method(a=serializers.CharField(), b=serializers.CharField())
    def object_static_method(cls, a, b):
        return {'a': a, 'b': b}


class Interface(interface.Interface, transpile_dest=TS_TRANSPILE_DEST):

    things = ThingType.as_type()
    thing_siblings = interface.ModelType(model_cls=ThingOneToOneTarget)
    child_things = interface.ModelType(model_cls=ThingChild)
    child_child_things = interface.ModelType(model_cls=ThingChildChild)
    timestamped_models = interface.ModelType(model_cls=TimestampedModel)
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
    def test_refresh(self):
        self._run_ts_test(test_name='refresh')

    @override_settings(ROOT_URLCONF=__name__)
    def test_create_invalid(self):
        self._run_ts_test(test_name='create_invalid')

    @override_settings(ROOT_URLCONF=__name__)
    def test_get_or_create_created(self):
        self._run_ts_test(test_name='get_or_create_created')

    @override_settings(ROOT_URLCONF=__name__)
    def test_get_or_create_not_created(self):
        self._run_ts_test(test_name='get_or_create_not_created')

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
    def test_filter_startswith(self):
        self._run_ts_test(test_name='filter_startswith')

    @override_settings(ROOT_URLCONF=__name__)
    def test_filter_in(self):
        self._run_ts_test(test_name='filter_in')

    @override_settings(ROOT_URLCONF=__name__)
    def test_exclude(self):
        self._run_ts_test(test_name='exclude')

    @override_settings(ROOT_URLCONF=__name__)
    def test_order_by(self):
        self._run_ts_test(test_name='order_by')

    @override_settings(ROOT_URLCONF=__name__)
    def test_order_by_descending(self):
        self._run_ts_test(test_name='order_by_descending')

    @override_settings(ROOT_URLCONF=__name__)
    def test_exists(self):
        self._run_ts_test(test_name='exists')

    @override_settings(ROOT_URLCONF=__name__)
    def test_exists_negative(self):
        self._run_ts_test(test_name='exists_negative')

    @override_settings(ROOT_URLCONF=__name__)
    def test_values(self):
        self._run_ts_test(test_name='values')

    @override_settings(ROOT_URLCONF=__name__)
    def _test_distinct_values(self):
        # Not supported by SQLite.
        self._run_ts_test(test_name='distinct_values')

    @override_settings(ROOT_URLCONF=__name__)
    def test_filter_or(self):
        self._run_ts_test(test_name='filter_or')

    @override_settings(ROOT_URLCONF=__name__)
    def test_get_reverse_related_one_to_one(self):
        self._run_ts_test(test_name='get_reverse_related_one_to_one')

    @override_settings(ROOT_URLCONF=__name__)
    def test_get_reverse_related(self):
        self._run_ts_test(test_name='get_reverse_related')

    @override_settings(ROOT_URLCONF=__name__)
    def test_get_forward_relation(self):
        self._run_ts_test(test_name='get_forward_relation')

    @override_settings(ROOT_URLCONF=__name__)
    def test_get_forward_relation_one_to_one(self):
        self._run_ts_test(test_name='get_forward_relation_one_to_one')

    @override_settings(ROOT_URLCONF=__name__)
    def test_get_forward_relation_prefetch(self):
        self._run_ts_test(test_name='get_forward_relation_prefetch')

    @override_settings(ROOT_URLCONF=__name__)
    def test_get_nested_forward_relation_prefetch(self):
        self._run_ts_test(test_name='get_nested_forward_relation_prefetch')

    @override_settings(ROOT_URLCONF=__name__)
    def test_get_forward_relation_prefetch_list(self):
        self._run_ts_test(test_name='get_forward_relation_prefetch_list')

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
    def test_create_timestamp(self):
        self._run_ts_test(test_name='create_timestamp')

    @override_settings(ROOT_URLCONF=__name__)
    def test_filter_dt(self):
        self._run_ts_test(test_name='filter_dt')

    @override_settings(ROOT_URLCONF=__name__)
    def test_filter_dt_range(self):
        self._run_ts_test(test_name='filter_dt_range')

    @override_settings(ROOT_URLCONF=__name__)
    def test_filter_is_null(self):
        self._run_ts_test(test_name='filter_is_null')

    @override_settings(ROOT_URLCONF=__name__)
    def test_detail_link(self):
        self._run_ts_test(test_name='detail_link')

    @override_settings(ROOT_URLCONF=__name__)
    def test_object_method(self):
        self._run_ts_test(test_name='object_method')

    @override_settings(ROOT_URLCONF=__name__)
    def test_object_static_method(self):
        self._run_ts_test(test_name='object_static_method')








