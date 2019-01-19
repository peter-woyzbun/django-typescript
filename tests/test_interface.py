from django.test import TestCase

from django_typescript import interface


# =================================
# Interface Tests
# ---------------------------------

class TestModelType(TestCase):

    def test_class_init_checks(self):
        with self.assertRaises(AssertionError):
            class BadInterface(interface.Interface):
                pass
