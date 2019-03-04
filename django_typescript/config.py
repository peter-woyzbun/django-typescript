from django.conf import settings


INTERFACE_PATH = getattr(settings, 'DJANGO_TS_INTERFACE')

FIELD_TYPES = getattr(settings, 'DJANGO_TS_FIELD_TYPES', {})
