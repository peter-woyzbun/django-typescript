from unittest import TestCase

from django_typescript.core.utils.typescript_template import TypeScriptTemplate


# =================================
# Test Typescript Template
# ---------------------------------

class TestTypescriptTemplate(TestCase):

    def test_template_block(self):
        template_str = "/*<{{ var_name }}>*/"
        template = TypeScriptTemplate(template_str=template_str)
        rendered = template.render(var_name='value')
        self.assertEqual(rendered, 'value')

    def test_name_literal(self):
        template_str = "__$var_name__"
        template = TypeScriptTemplate(template_str=template_str)
        rendered = template.render(var_name='value')
        self.assertEqual(rendered, 'value')

    def test_nested_string_template(self):
        template_str = "'{{ var_name }}'"
        template = TypeScriptTemplate(template_str=template_str)
        rendered = template.render(var_name='value')
        self.assertEqual(rendered, 'value')
