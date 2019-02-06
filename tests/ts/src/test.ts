import test from 'ava';

import {serverClient} from "./server/client";
import {Thing, ThingChild, ThingChildChild, ThingOneToOneTarget, TimestampedModel} from './server/models'
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

test('refresh', async t => {
    const [createdThing, responseData, statusCode, err] = await Thing.objects.create({name: 'test_thing'});
    const thingId = createdThing.pk();
    const [thingToUpdate] = await Thing.objects.get(thingId);
    await thingToUpdate.update({name: 'new_name'});
    const [refreshedThing] = await createdThing.refresh();
	t.is(refreshedThing.name, 'new_name');
});

test('create_invalid', async t => {
    const [createdThing, responseData, statusCode, err] = await Thing.objects.create({name: 'invalid_name'});
    t.is(createdThing, undefined);
	t.is(statusCode, 400);
});

test('get_or_create_created', async t => {
    const [[thing, created], responseData, statusCode, err] = await Thing.objects.getOrCreate({name: 'test_thing'});
	t.is(created, true);
});

test('get_or_create_not_created', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});

    const [[thing, created], responseData, statusCode, err] = await Thing.objects.getOrCreate({name: 'test_thing'});
	t.is(created, false);
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

test('order_by', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing', number: 1});
    const [createdThing2] = await Thing.objects.create({name: 'test_thing_2', number: 2});
    const [retrievedThings] = await Thing.objects.all().order_by('number').retrieve();
    t.is(retrievedThings[0].name, 'test_thing');
    t.is(retrievedThings[1].name, 'test_thing_2');
});

test('order_by_descending', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing', number: 1});
    const [createdThing2] = await Thing.objects.create({name: 'test_thing_2', number: 2});
    const [retrievedThings] = await Thing.objects.all().order_by(['-', 'number']).retrieve();
    t.is(retrievedThings[0].name, 'test_thing_2');
    t.is(retrievedThings[1].name, 'test_thing');
});

test('exists', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const [exists] = await Thing.objects.filter({name: 'test_thing'}).exists();
	t.is(exists, true);
});

test('exists_negative', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const [exists] = await Thing.objects.filter({name: 'dork'}).exists();
	t.is(exists, false);
});

test('values', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing', number: 1});
    const [createdThing2] = await Thing.objects.create({name: 'test_thing_2', number: 2});
    const [retrievedValues] = await Thing.objects.all().values('name');
    t.is(Object.keys(retrievedValues[0]).length, 1);
    t.is(Object.keys(retrievedValues[0])[0], 'name');
});

test('distinct_values', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing', number: 1});
    const [createdThing2] = await Thing.objects.create({name: 'test_thing', number: 2});
    const [retrievedValues] = await Thing.objects.all().distinct('name').values('name');
    t.is(retrievedValues.length, 1);
    t.is(Object.keys(retrievedValues[0]).length, 1);
    t.is(Object.keys(retrievedValues[0])[0], 'name');
});



test('get_reverse_related', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const [childThing] = await ThingChild.objects.create({parent_id: createdThing.pk()});
    const [childThings] = await createdThing.children().retrieve();
	t.is(childThings.length, 1);
});

test('get_reverse_related_one_to_one', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const [oneToOneTarget] = await ThingOneToOneTarget.objects.create({sibling_thing_id: createdThing.pk()});
    const [createdThingWithOneToOne] = await Thing.objects.get(createdThing.pk(), 'one_to_one_target');
	t.is(oneToOneTarget.pk(), createdThingWithOneToOne.one_to_one_target.pk());
});

test('get_forward_relation', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const [childThing] = await ThingChild.objects.create({parent_id: createdThing.pk()});

    const parentThing = await childThing.parent;
	t.is(createdThing.pk(), parentThing.pk());
});

test('get_forward_relation_one_to_one', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const [oneToOneTarget] = await ThingOneToOneTarget.objects.create({sibling_thing_id: createdThing.pk()});
    const siblingThing = await oneToOneTarget.sibling_thing;
	t.is(createdThing.pk(), siblingThing.pk());
});


test('get_forward_relation_prefetch', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const [childThing] = await ThingChild.objects.create({parent_id: createdThing.pk()});
    const [childThingWPrefetch] = await ThingChild.objects.get(childThing.pk(), 'parent');
    // No `await` should be required.
    const parentThing = childThingWPrefetch.parent;
	t.is(createdThing.pk(), parentThing.pk());
});

test('get_nested_forward_relation_prefetch', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const [childThing] = await ThingChild.objects.create({parent_id: createdThing.pk()});
    const [childChildThing] = await ThingChildChild.objects.create({parent_id: childThing.pk()});
    const [childChildThingWPrefetch] = await ThingChildChild.objects.get(childChildThing.pk(), {parent: 'parent'});
    // No `await` should be required.
    const parentThing = childChildThingWPrefetch.parent.parent;
	t.is(createdThing.pk(), parentThing.pk());
});

test('get_forward_relation_prefetch_list', async t => {
    const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const [childThing1] = await ThingChild.objects.create({parent_id: createdThing.pk()});
    const [childThing2] = await ThingChild.objects.create({parent_id: createdThing.pk()});
    const [childThingsWPrefetch] = await ThingChild.objects.all().prefetch('parent').retrieve();
    // No `await` should be required.
	t.is(childThingsWPrefetch[0].parent.pk(), createdThing.pk());
	t.is(childThingsWPrefetch[1].parent.pk(), createdThing.pk());
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

test('create_timestamp', async t => {
    const [timestampModel, responseData, statusCode] = await TimestampedModel.objects.create({timestamp: '2019-01-01T00:00:00'});
	t.is(timestampModel.timestamp, '2019-01-01T00:00:00');
});

test('all', async t => {
     const [createdThing] = await Thing.objects.create({name: 'test_thing'});
    const [createdThing2] = await Thing.objects.create({name: 'test_thing_2'});
    const [retrievedThings] = await Thing.objects.all().retrieve();
	t.is(retrievedThings.length, 2);
});

test('filter_dt', async t => {
    await TimestampedModel.objects.create({timestamp: '2019-01-01T00:00:00', name: 'a'});
    await TimestampedModel.objects.create({timestamp: '2019-01-02T00:00:00', name: 'b'});
    await TimestampedModel.objects.create({timestamp: '2019-01-03T00:00:00', name: 'c'});
	const [results] = await TimestampedModel.objects.filter({timestamp__gt: '2019-01-01T00:00:00'}).retrieve();
    t.is(results.length, 2);
});

test('filter_dt_range', async t => {
    await TimestampedModel.objects.create({timestamp: '2019-01-01T00:00:00', name: 'a'});
    await TimestampedModel.objects.create({timestamp: '2019-01-02T00:00:00', name: 'b'});
    await TimestampedModel.objects.create({timestamp: '2019-01-03T00:00:00', name: 'c'});
	const [results] = await TimestampedModel.objects.filter({timestamp__range: ['2019-01-01T00:00:00', '2019-01-02T00:00:00']}).retrieve();
    t.is(results.length, 2);
});

test('filter_is_null', async t => {
    await TimestampedModel.objects.create({timestamp: '2019-01-01T00:00:00', name: 'a'});
    await TimestampedModel.objects.create({timestamp: '2019-01-02T00:00:00'});
    await TimestampedModel.objects.create({timestamp: '2019-01-03T00:00:00', name: 'c'});
	const [results] = await TimestampedModel.objects.filter({name__isnull: true}).retrieve();
    t.is(results[0].timestamp, '2019-01-02T00:00:00');
});

test('detail_link', async t => {
   const [createdThing, responseData, statusCode, err] = await Thing.objects.create({name: 'test_thing'});
   Thing.setDetailLink((pk) => `thing/${pk}/`);
    t.is(createdThing.detailLink(), `thing/${createdThing.pk()}/`);
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





