from typing import Union, Type


# =================================
# Endpoint Parameter
# ---------------------------------

class Param(object):
    """
    Placeholder class for defining URL 'parameters'.

    """
    pass


# =================================
# Endpoint
# ---------------------------------

class Endpoint(object):

    """
    An `Endpoint` represents a URL that will be referenced on both
    the server-side and the interface-side. It provides a common
    interface for defining urls.

    """

    def __init__(self, *url_parts: Union[Type[Param], str]):
        self.url_parts = url_parts

    def url(self, param_value=None):
        if param_value is None:
            if Param in self.url_parts:
                raise AssertionError("Trying to render an `Endpoint` that contains a parameter but no value provided.")
            url = "/".join(self.url_parts)
            if not url.endswith('/') and len(url) > 0:
                url += '/'
            return url
        return "/".join([p if p != Param else param_value for p in self.url_parts]) + "/"
