

# =================================
# Current User ID Default
# ---------------------------------

class CurrentUserIDDefault(object):

    def set_context(self, serializer_field):
        self.user = serializer_field.context['request'].user

    def __call__(self):
        return self.user.pk