import pathlib
import os
import datetime
import tempfile

from rest_framework import serializers
from django.core.management import call_command
from django.test import TestCase, override_settings

from django_typescript import interface
from django_typescript.transpile import Transpiler

from .models import Thing


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
    timestamp = serializers.DateTimeField()
    name = serializers.CharField()


class GenericObjectType(interface.ObjectType, serializer_cls=ObjectTypeSerializer):

    def __init__(self, timestamp, name):
        self.timestamp = timestamp
        self.name = name

    @interface.ObjectType.method(delta_hours=serializers.IntegerField())
    def object_method(self, delta_hours):
        if not isinstance(self.timestamp, datetime.datetime):
            raise Exception
        return {'dt': self.timestamp + datetime.timedelta(hours=delta_hours)}

    @interface.ObjectType.method(a_datetime=serializers.DateTimeField())
    def object_method_w_arg_serializers(self, a_datetime):
        if not isinstance(a_datetime, datetime.datetime):
            raise Exception
        return {'dt': a_datetime}

    @classmethod
    @interface.ObjectType.static_method(a=serializers.CharField(), b=serializers.CharField())
    def object_static_method(cls, a, b):
        return {'a': a, 'b': b}


# =================================
# Tests
# ---------------------------------

class TestTranspiler(TestCase):

    def test_transpile(self):
        with tempfile.TemporaryDirectory() as tmp_dest_dir:
            class Interface(interface.Interface, transpile_dest=pathlib.Path(tmp_dest_dir)):
                things = ThingType.as_type()
                object_types = GenericObjectType
            transpiler = Transpiler(interface=Interface)
            transpiler.transpile()
            self.assertTrue(os.path.exists(str(pathlib.Path(tmp_dest_dir)/ 'server')))
            self.assertTrue(os.path.exists(str(pathlib.Path(tmp_dest_dir) / 'server' / 'client.ts')))
            self.assertTrue(os.path.exists(str(pathlib.Path(tmp_dest_dir) / 'server' / 'core')))
            self.assertTrue(os.path.exists(str(pathlib.Path(tmp_dest_dir) / 'server' / 'models.ts')))
            self.assertTrue(os.path.exists(str(pathlib.Path(tmp_dest_dir) / 'server' / 'objects.ts')))

    def test_transpile_command(self):
        import sys

        with tempfile.TemporaryDirectory() as tmp_dest_dir:
            class Interface(interface.Interface, transpile_dest=pathlib.Path(tmp_dest_dir)):
                things = ThingType.as_type()
                object_types = GenericObjectType
            with override_settings(DJANGO_TS_INTERFACE="tests.test_transpiler"):
                setattr(sys.modules[Interface.__module__], Interface.__name__, Interface)
                call_command('transpile')
                self.assertTrue(os.path.exists(str(pathlib.Path(tmp_dest_dir) / 'server')))
                self.assertTrue(os.path.exists(str(pathlib.Path(tmp_dest_dir) / 'server' / 'client.ts')))
                self.assertTrue(os.path.exists(str(pathlib.Path(tmp_dest_dir) / 'server' / 'core')))
                self.assertTrue(os.path.exists(str(pathlib.Path(tmp_dest_dir) / 'server' / 'models.ts')))
                self.assertTrue(os.path.exists(str(pathlib.Path(tmp_dest_dir) / 'server' / 'objects.ts')))





