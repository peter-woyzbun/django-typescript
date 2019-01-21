from django.db import models


# =================================
# Base Test Model
# ---------------------------------

class TestModel(models.Model):

    """
    Abstract base model for providing app label.

    """

    class Meta:
        abstract = True
        app_label = 'tests'


# =================================
# Test Models
# ---------------------------------

class Thing(TestModel):
    name = models.CharField(null=True, max_length=200)
    number = models.IntegerField(null=True)


class ThingOneToOneTarget(TestModel):
    sibling_thing = models.OneToOneField(Thing, related_name='one_to_one_target', on_delete=models.CASCADE)


class ThingChild(TestModel):
    parent = models.ForeignKey(Thing, related_name='children', on_delete=models.CASCADE)
    name = models.CharField(null=True, max_length=200)
    number = models.IntegerField(null=True)


class ThingChildChild(TestModel):
    parent = models.ForeignKey(ThingChild, related_name='children', on_delete=models.CASCADE)
    name = models.CharField(null=True, max_length=200)
    number = models.IntegerField(null=True)


class ThingChildChildChild(TestModel):
    parent = models.ForeignKey(ThingChildChild, related_name='children', on_delete=models.CASCADE)
    name = models.CharField(null=True, max_length=200)
    number = models.IntegerField(null=True)


class GenericModel(TestModel):
    name = models.CharField(null=True, max_length=200)


class TimestampedModel(TestModel):
    name = models.CharField(null=True, max_length=200)
    timestamp = models.DateTimeField(null=True)
