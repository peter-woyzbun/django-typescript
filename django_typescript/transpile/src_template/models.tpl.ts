import * as _ from 'lodash'

import {serverClient} from './client'
import {
    PaginatedData,
    PrimaryKey,
    foreignKeyField,
	propertyField,
	dateTimeField,
    ModelFieldsSchema,
    SuccessfulHttpStatusCodes,
    ServerPayload,
    ServerDataPayload,
	QuerysetValues,
	QuerysetValuesList,
	QuerysetModelList,
	ModelFieldOrdering,
	ServerResponse} from './core'

export type FieldType = '{{ field_types }}'



// -------------------------
// Flatten Lookups
//
// -------------------------

const flattenLookups = function(ob) {
	let toReturn = {};
	if (Array.isArray(ob)){return ob}
	for (let i in ob) {
		if (Array.isArray(ob[i])){
					toReturn[i] = ob[i];
					continue
				}
		if (!ob.hasOwnProperty(i)) {continue}

		if ((typeof ob[i]) === 'object') {
			let flatObject = flattenLookups(ob[i]);
			for (let x in flatObject) {

				if (!flatObject.hasOwnProperty(x)) {continue}

				toReturn[i + '__' + x] = flatObject[x];
			}
		} else {
			toReturn[i] = ob[i];
		}
	}
	return toReturn;
};


/*<
{{ models }}
>*/