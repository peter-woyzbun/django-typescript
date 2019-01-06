from typing import Union

from django.db import models


# Forward relations
FORWARD_RELATION_FIELDS = (models.ForeignKey, models.OneToOneField)
ForwardRelationField = Union[models.ForeignKey, models.OneToOneField]

# Reverse relations
REVERSE_RELATION_FIELDS = (models.ManyToOneRel, )

# Relation fields
RELATION_FIELDS = FORWARD_RELATION_FIELDS + REVERSE_RELATION_FIELDS

# Unsupported fields
UNSUPPORTED_FIELDS = (models.ManyToManyField, )


