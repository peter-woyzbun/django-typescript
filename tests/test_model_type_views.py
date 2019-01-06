import json

from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from django_typescript import interface

from .models import ThingSerializer, Thing, ThingChildSerializer, ThingChild


# =================================
# Interface
# ---------------------------------

class ThingType(interface.ModelType, model_cls=Thing):

    @interface.ModelType.method()
    def thing_method(self: Thing, a, b):
        return {'a': a, 'b': b, 'id': self.pk}

    @interface.ModelType.static_method()
    def thing_static_method(cls, a, b):
        return {'a': a, 'b': b}

    def validate(self, name: str):
        if name == 'invalid_name':
            raise interface.ValidationError({'name': 'Name invalid.'})


class Interface(interface.Interface):
    things = ThingType.as_type()
    child_things = interface.ModelType(model_cls=ThingChild)


urlpatterns = Interface.urlpatterns()


# =================================
# Tests
# ---------------------------------

# Override settings to load urlpatterns from this module (defined above).
@override_settings(ROOT_URLCONF=__name__)
class TestModelTypeViews(TestCase):

    client: APIClient

    def setUp(self):
        self.client = APIClient()

    def test_get_view(self):
        thing = Thing.objects.create(name='test')
        view_url = reverse('thing:get', kwargs={'pk': thing.id})
        response = self.client.get(view_url)
        self.assertEqual('test', response.data['name'])

    def test_create_view(self):
        data = {'name': 'test'}
        view_url = reverse('thing:create')
        response = self.client.post(view_url, data=data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Thing.objects.filter(name='test').exists())

    def test_create_view_validate(self):
        data = {'name': 'invalid_name'}
        view_url = reverse('thing:create')
        response = self.client.post(view_url, data=data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_view(self):
        thing = Thing.objects.create()
        view_url = reverse('thing:update', kwargs={'pk': thing.id})
        data = {'name': 'new name'}
        response = self.client.post(view_url, data=data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        thing.refresh_from_db()
        self.assertEqual(thing.name, 'new name')

    def test_delete_view(self):
        thing = Thing.objects.create()
        thing_id = thing.id
        view_url = reverse('thing:delete', kwargs={'pk': thing.id})
        response = self.client.delete(view_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Thing.objects.filter(id=thing_id).exists())

    def test_list_view_no_query(self):
        thing_1 = Thing.objects.create(name='1')
        thing_2 = Thing.objects.create(name='2')
        view_url = reverse('thing:list')
        response = self.client.get(view_url)
        self.assertEqual(len(response.data), 2)

    def test_list_view_query_filter(self):
        thing_1 = Thing.objects.create(name='1')
        thing_2 = Thing.objects.create(name='2')
        view_url = reverse('thing:list')
        query = {
            'filters': {'name__in': ['1']},
            'exclude': {},
            'or_': []
        }
        query_str = json.dumps(query)
        view_url += '?query=' + query_str
        response = self.client.get(view_url)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], '1')

    def test_list_view_query_filter_or(self):
        thing_1 = Thing.objects.create(name='1')
        thing_2 = Thing.objects.create(name='2')
        view_url = reverse('thing:list')
        query = {
            'filters': {'name__in': ['1']},
            'exclude': {},
            'or_': [{
            'filters': {'name__in': ['2']},
            'exclude': {},
            'or_': []
        }]
        }
        query_str = json.dumps(query)
        view_url += '?query=' + query_str
        response = self.client.get(view_url)
        self.assertEqual(len(response.data), 2)

    def test_list_view_query_filter_exclude(self):
        thing_1 = Thing.objects.create(name='1')
        thing_2 = Thing.objects.create(name='2')
        view_url = reverse('thing:list')
        query = {
            'exclude': {'name__in': ['1']},
            'filters': {},
            'or_': []
        }
        query_str = json.dumps(query)
        view_url += '?query=' + query_str
        response = self.client.get(view_url)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], '2')

    def test_list_view_field_subset(self):
        thing_1 = Thing.objects.create(name='1')
        thing_2 = Thing.objects.create(name='2')
        view_url = reverse('thing:list')
        query = {
            'exclude': {'name__in': ['1']},
            'filters': {},
            'or_': []
        }
        query_str = json.dumps(query)
        view_url += '?query=' + query_str + "&fields=" + json.dumps(['name'])
        response = self.client.get(view_url)
        self.assertEqual(set(response.data[0].keys()), {'name'})

    def test_list_view_paginated(self):
        thing_1 = Thing.objects.create(name='1')
        thing_2 = Thing.objects.create(name='2')
        view_url = reverse('thing:list')
        query = {
            'filters': {},
            'exclude': {},
            'or_': []
        }
        query_str = json.dumps(query)
        view_url += '?query=' + query_str + "&fields=" + json.dumps(['name']) + "&page=1&pagesize=1"
        response = self.client.get(view_url)
        self.assertEqual(response.data['num_results'], 2)
        self.assertEqual(response.data['num_pages'], 2)

        self.assertEqual(len(response.data['data']), 1)

    def test_list_view_paginated_ordered(self):
        thing_1 = Thing.objects.create(name='1')
        thing_2 = Thing.objects.create(name='2')
        view_url = reverse('thing:list')
        query = {
            'filters': {},
            'exclude': {},
            'or_': []
        }
        query_str = json.dumps(query)
        view_url += '?query=' + query_str + "&fields=" + json.dumps(['name']) + \
                    "&page=1&pagesize=1&order_on=" + json.dumps(['name'])
        response = self.client.get(view_url)
        self.assertEqual(response.data['num_results'], 2)
        self.assertEqual(response.data['num_pages'], 2)

        self.assertEqual(len(response.data['data']), 1)
        self.assertEqual(len(response.data['data'][0]['name']), 1)

    def test_method(self):
        thing = Thing.objects.create(name='1')
        view_url = reverse('thing:thing_method', kwargs={'pk': thing.id})
        data = {'a': 'test_a', 'b': 'test_b'}
        response = self.client.post(view_url, data=data, format='json')
        self.assertEqual(response.data['a'], 'test_a')
        self.assertEqual(response.data['b'], 'test_b')
        self.assertEqual(response.data['id'], thing.id)

    def test_static_method(self):
        view_url = reverse('thing:thing_static_method')
        data = {'a': 'test_a', 'b': 'test_b'}
        response = self.client.post(view_url, data=data, format='json')
        self.assertEqual(response.data['a'], 'test_a')
        self.assertEqual(response.data['b'], 'test_b')
