from django.test import TestCase

from django_typescript.model_types.model_type import ModelType
from django_typescript.model_types.validator import ModelTypeValidator
from django_typescript import interface

from .models import Thing, ThingChild


# =================================
# Model Type Tests
# ---------------------------------

class TestModelType(TestCase):

    def test_class_init_checks(self):
        with self.assertRaises(AssertionError):
            class BadModelType(interface.ModelType):
                pass

    def test_validator_field_check(self):
        """
        An AssertionError should be raised if a `ModelType` has a `validate`
        method that references a non-existant field in its arguments.


        """
        class ThingModelType(interface.ModelType, model_cls=Thing):
            pass

        def validate(self, non_existent_field):
            pass

        with self.assertRaises(AssertionError):
            _ = type("ModelSubType", (ThingModelType,), {'validate': validate})

    def test_resolve_forward_relation(self):
        parent_thing = Thing.objects.create()
        class ThingChildModelType(interface.ModelType, model_cls=ThingChild):

            def validate(self_, parent):
                self.assertTrue(isinstance(parent, Thing))

        serializer = ThingChildModelType.as_type().serializer_cls()
        serializer.validate({'parent_id': parent_thing.id})

    def test_foreign_key(self):
        parent_thing = Thing.objects.create()
        model_type = ModelType(model_cls=ThingChild)
        child_thing = model_type.serializer_cls().create({'parent_id': parent_thing.id})
        self.assertTrue(child_thing.parent is not None)
        self.assertEqual(child_thing.parent.id, parent_thing.id)

    def test_relation_field_init(self):
        model_type = ModelType(model_cls=ThingChild)
        self.assertEqual(len(model_type.forward_relation_fields), 1)
        self.assertEqual(model_type.forward_relation_fields[0].name, 'parent_id')
