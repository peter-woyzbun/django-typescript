from django.test import TestCase
from rest_framework import serializers


from django_typescript import interface


# =================================
# Object Type Tests
# ---------------------------------

class TestObjectType(TestCase):

    def test_class_init_check_no_serializer(self):
        with self.assertRaises(AssertionError):
            class BadObjectType(interface.ObjectType):
                pass

    def test_class_init_check_bad_serializer(self):
        class BadSerializer(serializers.Serializer):
            name = serializers.CharField()

        with self.assertRaises(AssertionError):
            class BadObjectType(interface.ObjectType, serializer_cls=BadSerializer):

                def __init__(self, not_name):
                    self.not_name = not_name
