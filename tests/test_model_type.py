import json

from django.test import TestCase

from django_typescript.model_types.model_type import ModelType

from .models import Thing, ThingChild


# =================================
# Serializer Tests
# ---------------------------------

class TestModelTypeSerializer(TestCase):

    def test_foreign_key(self):
        parent_thing = Thing.objects.create()
        model_type = ModelType(model_cls=ThingChild)
        child_thing = model_type.serializer_cls().create({'parent_id': parent_thing.id})
        self.assertTrue(child_thing.parent is not None)
        self.assertEqual(child_thing.parent.id, parent_thing.id)


# =================================
# ModelType Field Tests
# ---------------------------------

class TestModelTypeFields(TestCase):

    def test_relation_field_init(self):
        model_type = ModelType(model_cls=ThingChild)
        self.assertEqual(len(model_type.forward_relation_fields), 1)
        self.assertEqual(model_type.forward_relation_fields[0].name, 'parent_id')
        
