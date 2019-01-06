from django.core.exceptions import ImproperlyConfigured


class DjangoTypeScriptException(Exception):
    pass


class TranspileError(DjangoTypeScriptException):
    pass


class InterfaceError(DjangoTypeScriptException, ImproperlyConfigured):
    pass


class ModelTypeImproperlyConfigured(DjangoTypeScriptException, ImproperlyConfigured):
    pass


class EndpointError(InterfaceError):
    pass


class TypeScriptTemplateError(DjangoTypeScriptException):
    pass