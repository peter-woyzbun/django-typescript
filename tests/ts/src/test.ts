import test from 'ava';

import {serverClient} from "./server/client";
import {Thing, ThingChild} from './server/models'
import {GenericObjectType} from "./server/objects";


// -------------------------
// Server Client Setup
//
// -------------------------


serverClient.setup(process.env.SERVER_URL + '/');


// -------------------------
// Model Type Tests
//
// -------------------------

test('create_and_get', async t => {
    const [createdThing, responseData, statusCode, err] = await Thing.objects.create({name: 'test_thing'});
    const thingId = createdThing.pk();
    const [retrievedThing] = await Thing.objects.get(thingId);
	t.is(thingId, retrievedThing.pk());
});

test('create_invalid', async t => {
    const [createdThing, responseData, statusCode, err] = await Thing.objects.create({name: 'invalid_name'});
    t.is(createdThing, undefined);
	t.is(statusCode, 400);
});

test('update', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const thingId = createdThing.pk();
    const [updatedThing] = await createdThing.update({name: 'new_name'});
	t.is(updatedThing.name, 'new_name');
});

test('create_and_delete', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const thingId = createdThing.pk() as number;
    await createdThing.delete();
    const [retrievedThings] = await Thing.objects.filter({id__in: [thingId]}).retrieve();
	t.is(retrievedThings.length, 0);
});

test('filter', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const [retrievedThings] = await Thing.objects.filter({name: 'test_thing'}).retrieve();
	t.is(retrievedThings[0].name, 'test_thing');
});

test('filter_or', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const [createdThing2] = await Thing.objects.create({name: 'test_thing_2'});
    const [retrievedThings] = await Thing.objects.filter({name: 'test_thing'}).or(Thing.objects.filter({name: 'test_thing_2'})).retrieve();
	t.is(retrievedThings.length, 2);
});

test('filter_startswith', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const [createdThing2] = await Thing.objects.create({name: 'test_thing_2'});
    const [retrievedThings] = await Thing.objects.filter({name__startswith: 'test'}).retrieve();
	t.is(retrievedThings.length, 2);
});

test('filter_in', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const [createdThing2] = await Thing.objects.create({name: 'test_thing_2'});
    const [retrievedThings] = await Thing.objects.filter({name__in: ['test_thing', 'test_thing_2']}).retrieve();
	t.is(retrievedThings.length, 2);
});

test('exclude', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const [createdThing2] = await Thing.objects.create({name: 'test_thing_2'});
    const [retrievedThings] = await Thing.objects.exclude({name: 'test_thing'}).retrieve();
	t.is(retrievedThings.length, 1);
    t.is(retrievedThings[0].name, 'test_thing_2');
});

test('get_reverse_related', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const [childThing] = await ThingChild.objects.create({parent_id: createdThing.pk()});
    const [childThings] = await createdThing.children().retrieve();
	t.is(childThings.length, 1);
});

test('get_forward_relation', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const [childThing] = await ThingChild.objects.create({parent_id: createdThing.pk()});

    const parentThing = await childThing.parent;
	t.is(createdThing.pk(), parentThing.pk());
});

test('filter_reverse_related', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const [childThing] = await ThingChild.objects.create({parent_id: createdThing.pk()});
    const [childThing2] = await ThingChild.objects.create({parent_id: createdThing.pk(), name: 'target'});
    const [childThings] = await createdThing.children({name: 'target'}).retrieve();
	t.is(childThings.length, 1);
});

test('thing_method', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const [result] = await createdThing.thing_method({a: 'x', b: 'y'});
	t.is(result['a'], 'x');
	t.is(result['b'], 'y');
	t.is(result['id'], createdThing.pk());
});

test('thing_static_method', async t => {
    const [result] = await Thing.thing_static_method({a: 'x', b: 'y'});
	t.is(result['a'], 'x');
	t.is(result['b'], 'y');
});


// -------------------------
// Object Type Tests
//
// -------------------------

test('object_method', async t => {
    const obj = new GenericObjectType({name: 'test_object', value: 10})
    const [result] = await obj.object_method({add_value: 10});
    t.is(result['total_value'], 20);
});

test('object_static_method', async t => {
    const [result] = await GenericObjectType.object_static_method({a: 'x', b: 'y'});
	t.is(result['a'], 'x');
	t.is(result['b'], 'y');
});





