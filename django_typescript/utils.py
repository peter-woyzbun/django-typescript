from rest_framework.compat import unicode_to_repr


# =================================
# Current User ID Default
# ---------------------------------

class CurrentUserIDDefault(object):

    def set_context(self, serializer_field):
        self.user = serializer_field.context['request'].user

    def __call__(self):
        return self.user.pk

    def __repr__(self):
        return unicode_to_repr('%s()' % self.__class__.__name__)
