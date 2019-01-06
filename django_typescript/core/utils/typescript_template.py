import re

import jinja2
from jinja2 import meta, Environment
import pyparsing as pp

from django_typescript.core.exceptions import TypeScriptTemplateError


# =================================
# Typescript Template
# ---------------------------------

class TypeScriptTemplate(object):

    """
    Helper class for rendering TypeScript templates. Syntax:

        1) Jinja2 template block:

        /*<
            ...
        >*/

        2) Name literal:

        __$...__

        3) Nested string template:

        '{{...}}'


    """

    NO_UNUSED_PARAMS = False

    def __init__(self, template_str: str):
        self.template_str = template_str
        self.used_params = []

    def _render_template_comment(self, toks, kwargs):
        env = Environment()
        ast = env.parse(toks[0])
        for param_name in jinja2.meta.find_undeclared_variables(ast):
            self.used_params.append(param_name)
        template = jinja2.Template(toks[0])
        return template.render(**kwargs).strip('\n')

    def _render_name(self, tok, kwargs):
        if tok not in kwargs:
            raise TypeScriptTemplateError(f"No value provided for parameter `{tok}`.")
        self.used_params.append(tok)
        return kwargs[tok]

    def _render_template_string(self, tok, kwargs):
        if tok not in kwargs:
            raise TypeScriptTemplateError(f"No value provided for parameter `{tok}`.")
        self.used_params.append(tok)
        return kwargs[tok]

    def render(self, **kwargs):
        tmpl_comment_open = pp.Literal("/*<").suppress()
        tmpl_comment_close = pp.Literal(">*/").suppress()

        tmpl_comment = (tmpl_comment_open + pp.SkipTo(tmpl_comment_close) + tmpl_comment_close)\
            .setParseAction(lambda x: self._render_template_comment(x, kwargs))

        name = pp.Combine(pp.nestedExpr("__$", "__")).setParseAction(lambda x: self._render_name(x[0], kwargs))

        template_string = pp.Combine(pp.nestedExpr("'{{", "}}'")).setParseAction(
            lambda x: self._render_template_string(x[0], kwargs))

        output = tmpl_comment.transformString(self.template_str)
        output = name.transformString(output)
        output = template_string.transformString(output)
        if set(kwargs.keys()) != set(self.used_params) and self.NO_UNUSED_PARAMS:
            unused_params = ", ".join(set(kwargs.keys()) - set(self.used_params))
            raise TypeScriptTemplateError(f"One or more unused template parameters: {unused_params}")
        return output

    @classmethod
    def open(cls, path) -> 'TypeScriptTemplate':
        with open(path, 'r') as template_file:
            template_str = template_file.read()
        return cls(template_str=template_str)
