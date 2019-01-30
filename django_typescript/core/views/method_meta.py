from rest_framework.request import Request


# =================================
# Method Meta
# ---------------------------------

class MethodMeta(object):

    def __init__(self, request: Request):
        self.request = request
