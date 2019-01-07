from django_typescript.core import typescript_types


# =================================
# Literal Transpiler
# ---------------------------------

class LiteralTranspiler(object):

    LITERAL_TRANSPILERS = {
        False: 'false',
        True: 'true',
        None: 'null'
    }

    @classmethod
    def transpile(cls, value):
        return cls.LITERAL_TRANSPILERS[value]