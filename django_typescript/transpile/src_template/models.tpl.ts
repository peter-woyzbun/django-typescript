import {serverClient} from './client'
import {
    PaginatedData,
    PrimaryKey,
    foreignKeyField,
    ModelFieldsSchema,
    SuccessfulHttpStatusCodes,
    ServerPayload,
    ServerDataPayload} from './core'

export type FieldType = '{{ field_types }}'


const flattenLookups = function(ob) {
	let toReturn = {};

	for (let i in ob) {
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