import json

from django.test import TestCase

from django_typescript.model_types.field import ModelTypeField

from .models import Thing, ThingChild


# =================================
# Tests
# ---------------------------------

class TestModelTypeFields(TestCase):

    def test_reverse_relation_reverse_lookup_key(self):
        model_type_field = ModelTypeField(model_field=Thing._meta.get_field('children'))
        self.assertEqual(model_type_field.reverse_lookup_key, 'parent__id')
