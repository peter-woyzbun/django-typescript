import { serverClient } from './client'
import {
    PaginatedData,
    PrimaryKey,
    foreignKeyField,
    ModelFieldsSchema,
    SuccessfulHttpStatusCodes,
    ServerPayload,
    ServerDataPayload
} from './core'

export type FieldType = 'ForeignKey' | 'IntegerField' | 'AutoField' | 'CharField'


const flattenLookups = function(ob) {
    let toReturn = {};
    if (Array.isArray(ob)) { return ob }
    for (let i in ob) {
        if (Array.isArray(ob[i])) {
            toReturn[i] = ob[i];
            continue
        }
        if (!ob.hasOwnProperty(i)) { continue }

        if ((typeof ob[i]) === 'object') {
            let flatObject = flattenLookups(ob[i]);
            for (let x in flatObject) {

                if (!flatObject.hasOwnProperty(x)) { continue }

                toReturn[i + '__' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
};


// -------------------------
// ThingQuerySet
//
// -------------------------


export type ThingPrefetchKey = never



export interface ThingQuerySetLookups {
    id?: number
    id__exact?: number
    id__iexact?: number
    id__gt?: number
    id__gte?: number
    id__lt?: number
    id__lte?: number
    id__in?: number[]
    id__contains?: number
    id__icontains?: number
    id__startswith?: number
    id__istartswith?: number
    id__endswith?: number
    id__iendswith?: number
    id__range?: [number, number]
    id__isnull?: boolean
    id__regex?: number
    id__iregex?: number
    name?: string
    name__exact?: string
    name__iexact?: string
    name__gt?: string
    name__gte?: string
    name__lt?: string
    name__lte?: string
    name__in?: string[]
    name__contains?: string
    name__icontains?: string
    name__startswith?: string
    name__istartswith?: string
    name__endswith?: string
    name__iendswith?: string
    name__range?: [string, string]
    name__isnull?: boolean
    name__regex?: string
    name__iregex?: string
    number?: number
    number__exact?: number
    number__iexact?: number
    number__gt?: number
    number__gte?: number
    number__lt?: number
    number__lte?: number
    number__in?: number[]
    number__contains?: number
    number__icontains?: number
    number__startswith?: number
    number__istartswith?: number
    number__endswith?: number
    number__iendswith?: number
    number__range?: [number, number]
    number__isnull?: boolean
    number__regex?: number
    number__iregex?: number
    children?: ThingChildQuerySetLookups
}

export class ThingQuerySet {

    protected lookups: ThingQuerySetLookups;
    protected excludedLookups: ThingQuerySetLookups;
    protected _or: ThingQuerySet[] = [];
    protected _prefetch: ThingPrefetchKey[];


    constructor(lookups: ThingQuerySetLookups = {}, excludedLookups: ThingQuerySetLookups = {}) {
        this.lookups = lookups;
        this.excludedLookups = excludedLookups;
    }

    public prefetch(...prefetchKeys: ThingPrefetchKey[]): this {
        const existingPrefetch: ThingPrefetchKey[] = this._prefetch ? (this._prefetch) : ([] as ThingPrefetchKey[]);
        this._prefetch = [...existingPrefetch, ...prefetchKeys];
        return this
    }

    public static all(): ThingQuerySet {
        return new ThingQuerySet()
    }

    public static filter(lookups: Partial<ThingQuerySetLookups>): ThingQuerySet {
        return new ThingQuerySet(lookups)
    }

    public filter(lookups: Partial<ThingQuerySetLookups>): ThingQuerySet {
        return new ThingQuerySet({ ...this.lookups, ...lookups }, this.excludedLookups)
    }

    public static exclude(lookups: Partial<ThingQuerySetLookups>): ThingQuerySet {
        return new ThingQuerySet({}, lookups)
    }

    public exclude(lookups: Partial<ThingQuerySetLookups>): ThingQuerySet {
        return new ThingQuerySet({}, { ...this.excludedLookups, ...lookups })
    }

    public or(queryset: ThingQuerySet): this {
        this._or.push(queryset);
        return this
    }

    public static async get(primaryKey: number, ...prefetchKeys: ThingPrefetchKey[]): Promise<ServerPayload<Thing>> {
        let urlQuery = '';
        if (prefetchKeys) {
            urlQuery += "prefetch=" + JSON.stringify(prefetchKeys)
        }
        let [responseData, statusCode, err] = await serverClient.get(`thing/${primaryKey}/get/`, urlQuery);
        if (statusCode === 200) {
            return [new Thing(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public static async create(data: Partial<ThingFields>): Promise<ServerPayload<Thing>> {
        let [responseData, statusCode, err] = await serverClient.post(`thing/create/`, data);

        if (statusCode === 201) {
            return [new Thing(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public serialize(): object {
        return {
            filters: flattenLookups(this.lookups),
            exclude: flattenLookups(this.excludedLookups),
            or_: this._or.map((queryset) => queryset.serialize())
        }
    }

    public async values(...fields: Array<[keyof ThingFields]>): Promise<ServerDataPayload<object[]>> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields);
        let [responseData, statusCode, err] = await serverClient.get(`thing//`, urlQuery);
        return [responseData, statusCode, err]

    }

    public async pageValues(pageNum: number = 1, pageSize: number = 25,
        ...fields: Array<[keyof ThingFields]>): Promise<ServerDataPayload<PaginatedData<object>>> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields) + "&page=" + pageNum + "&pagesize=" + pageSize;
        let [responseData, statusCode, err] = await serverClient.get(`thing//`, urlQuery);
        return [responseData, statusCode, err]
    }

    public async retrieve(): Promise<ServerPayload<Thing[]>> {
        let urlQuery = "query=" + JSON.stringify(this.serialize());
        if (this._prefetch) {
            urlQuery += "&prefetch=" + JSON.stringify(this._prefetch)
        }
        let [responseData, statusCode, err] = await serverClient.get(`thing//`, urlQuery);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [responseData.map((data) => new Thing(data)), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public async retrievePage(pageNum: number = 1, pageSize: number = 25): Promise<ServerPayload<PaginatedData<Thing>>> {
        let urlQuery = "query=" + JSON.stringify(this.serialize()) + "&page=" + pageNum + "&pagesize=" + pageSize;
        if (this._prefetch) {
            urlQuery += "&prefetch=" + JSON.stringify(this._prefetch)
        }
        let [responseData, statusCode, err] = await serverClient.get(`thing//`, urlQuery);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [{
                ...responseData,
                data: responseData.data.map((data) => new Thing(data))
            }, responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

}


// -------------------------
// Thing
//
// -------------------------


export interface ThingFields {
    readonly id: number
    name?: string
    number?: number
}


export class Thing implements ThingFields {

    readonly id: number
    name?: string
    number?: number

    public static readonly FIELD_SCHEMAS: ModelFieldsSchema<FieldType> = {
        id: { fieldName: 'id', fieldType: 'AutoField', nullable: false, isReadOnly: true },
        name: { fieldName: 'name', fieldType: 'CharField', nullable: true, isReadOnly: false },
        number: { fieldName: 'number', fieldType: 'IntegerField', nullable: true, isReadOnly: false }
    }

    constructor(data: ThingFields) {
        Object.assign(this, data);
    }

    static objects = ThingQuerySet;

    public pk(): number {
        return this.id
    }

    public async update(data: Partial<ThingFields>): Promise<ServerPayload<Thing>> {
        let [responseData, statusCode, err] = await serverClient.post(`thing/${this.pk()}/update/`, data);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [new Thing(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err];
    }

    public async delete() {
        return await serverClient.delete(`thing/${this.pk()}/delete/`);
    }

    public children(lookups: ThingChildQuerySetLookups = {}) {
        return new ThingChildQuerySet({ ...lookups, ...{ parent__id: this.pk() } })
    }


    public async thing_method(data: { a: string, b: string }) {
        return await serverClient.post(`thing/thing-method/${this.pk()}/`, data);
    }


    public static async thing_static_method(data: { a: string, b: string }) {
        return await serverClient.post(`thing/thing-static-method/`, data);
    }



}

// -------------------------
// ThingChildQuerySet
//
// -------------------------


export type ThingChildPrefetchKey = 'parent' | { parent: ThingPrefetchKey }



export interface ThingChildQuerySetLookups {
    id?: number
    id__exact?: number
    id__iexact?: number
    id__gt?: number
    id__gte?: number
    id__lt?: number
    id__lte?: number
    id__in?: number[]
    id__contains?: number
    id__icontains?: number
    id__startswith?: number
    id__istartswith?: number
    id__endswith?: number
    id__iendswith?: number
    id__range?: [number, number]
    id__isnull?: boolean
    id__regex?: number
    id__iregex?: number
    name?: string
    name__exact?: string
    name__iexact?: string
    name__gt?: string
    name__gte?: string
    name__lt?: string
    name__lte?: string
    name__in?: string[]
    name__contains?: string
    name__icontains?: string
    name__startswith?: string
    name__istartswith?: string
    name__endswith?: string
    name__iendswith?: string
    name__range?: [string, string]
    name__isnull?: boolean
    name__regex?: string
    name__iregex?: string
    number?: number
    number__exact?: number
    number__iexact?: number
    number__gt?: number
    number__gte?: number
    number__lt?: number
    number__lte?: number
    number__in?: number[]
    number__contains?: number
    number__icontains?: number
    number__startswith?: number
    number__istartswith?: number
    number__endswith?: number
    number__iendswith?: number
    number__range?: [number, number]
    number__isnull?: boolean
    number__regex?: number
    number__iregex?: number
    parent?: ThingQuerySetLookups
    children?: ThingChildChildQuerySetLookups
}

export class ThingChildQuerySet {

    protected lookups: ThingChildQuerySetLookups;
    protected excludedLookups: ThingChildQuerySetLookups;
    protected _or: ThingChildQuerySet[] = [];
    protected _prefetch: ThingChildPrefetchKey[];


    constructor(lookups: ThingChildQuerySetLookups = {}, excludedLookups: ThingChildQuerySetLookups = {}) {
        this.lookups = lookups;
        this.excludedLookups = excludedLookups;
    }

    public prefetch(...prefetchKeys: ThingChildPrefetchKey[]): this {
        const existingPrefetch: ThingChildPrefetchKey[] = this._prefetch ? (this._prefetch) : ([] as ThingChildPrefetchKey[]);
        this._prefetch = [...existingPrefetch, ...prefetchKeys];
        return this
    }

    public static all(): ThingChildQuerySet {
        return new ThingChildQuerySet()
    }

    public static filter(lookups: Partial<ThingChildQuerySetLookups>): ThingChildQuerySet {
        return new ThingChildQuerySet(lookups)
    }

    public filter(lookups: Partial<ThingChildQuerySetLookups>): ThingChildQuerySet {
        return new ThingChildQuerySet({ ...this.lookups, ...lookups }, this.excludedLookups)
    }

    public static exclude(lookups: Partial<ThingChildQuerySetLookups>): ThingChildQuerySet {
        return new ThingChildQuerySet({}, lookups)
    }

    public exclude(lookups: Partial<ThingChildQuerySetLookups>): ThingChildQuerySet {
        return new ThingChildQuerySet({}, { ...this.excludedLookups, ...lookups })
    }

    public or(queryset: ThingChildQuerySet): this {
        this._or.push(queryset);
        return this
    }

    public static async get(primaryKey: number, ...prefetchKeys: ThingChildPrefetchKey[]): Promise<ServerPayload<ThingChild>> {
        let urlQuery = '';
        if (prefetchKeys) {
            urlQuery += "prefetch=" + JSON.stringify(prefetchKeys)
        }
        let [responseData, statusCode, err] = await serverClient.get(`thing-child/${primaryKey}/get/`, urlQuery);
        if (statusCode === 200) {
            return [new ThingChild(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public static async create(data: Partial<ThingChildFields>): Promise<ServerPayload<ThingChild>> {
        let [responseData, statusCode, err] = await serverClient.post(`thing-child/create/`, data);

        if (statusCode === 201) {
            return [new ThingChild(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public serialize(): object {
        return {
            filters: flattenLookups(this.lookups),
            exclude: flattenLookups(this.excludedLookups),
            or_: this._or.map((queryset) => queryset.serialize())
        }
    }

    public async values(...fields: Array<[keyof ThingChildFields]>): Promise<ServerDataPayload<object[]>> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields);
        let [responseData, statusCode, err] = await serverClient.get(`thing-child//`, urlQuery);
        return [responseData, statusCode, err]

    }

    public async pageValues(pageNum: number = 1, pageSize: number = 25,
        ...fields: Array<[keyof ThingChildFields]>): Promise<ServerDataPayload<PaginatedData<object>>> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields) + "&page=" + pageNum + "&pagesize=" + pageSize;
        let [responseData, statusCode, err] = await serverClient.get(`thing-child//`, urlQuery);
        return [responseData, statusCode, err]
    }

    public async retrieve(): Promise<ServerPayload<ThingChild[]>> {
        let urlQuery = "query=" + JSON.stringify(this.serialize());
        if (this._prefetch) {
            urlQuery += "&prefetch=" + JSON.stringify(this._prefetch)
        }
        let [responseData, statusCode, err] = await serverClient.get(`thing-child//`, urlQuery);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [responseData.map((data) => new ThingChild(data)), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public async retrievePage(pageNum: number = 1, pageSize: number = 25): Promise<ServerPayload<PaginatedData<ThingChild>>> {
        let urlQuery = "query=" + JSON.stringify(this.serialize()) + "&page=" + pageNum + "&pagesize=" + pageSize;
        if (this._prefetch) {
            urlQuery += "&prefetch=" + JSON.stringify(this._prefetch)
        }
        let [responseData, statusCode, err] = await serverClient.get(`thing-child//`, urlQuery);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [{
                ...responseData,
                data: responseData.data.map((data) => new ThingChild(data))
            }, responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

}


// -------------------------
// ThingChild
//
// -------------------------


export interface ThingChildFields {
    readonly id: number
    name?: string
    number?: number
    parent_id: number
}


export class ThingChild implements ThingChildFields {

    readonly id: number
    name?: string
    number?: number
    parent_id: number
    @foreignKeyField(() => Thing) parent?: Thing

    public static readonly FIELD_SCHEMAS: ModelFieldsSchema<FieldType> = {
        id: { fieldName: 'id', fieldType: 'AutoField', nullable: false, isReadOnly: true },
        name: { fieldName: 'name', fieldType: 'CharField', nullable: true, isReadOnly: false },
        number: { fieldName: 'number', fieldType: 'IntegerField', nullable: true, isReadOnly: false },
        parent_id: { fieldName: 'parent_id', fieldType: 'IntegerField', nullable: false, isReadOnly: false, relatedModel: () => Thing }
    }

    constructor(data: ThingChildFields) {
        Object.assign(this, data);
    }

    static objects = ThingChildQuerySet;

    public pk(): number {
        return this.id
    }

    public async update(data: Partial<ThingChildFields>): Promise<ServerPayload<ThingChild>> {
        let [responseData, statusCode, err] = await serverClient.post(`thing-child/${this.pk()}/update/`, data);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [new ThingChild(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err];
    }

    public async delete() {
        return await serverClient.delete(`thing-child/${this.pk()}/delete/`);
    }

    public children(lookups: ThingChildChildQuerySetLookups = {}) {
        return new ThingChildChildQuerySet({ ...lookups, ...{ parent__id: this.pk() } })
    }







}

// -------------------------
// ThingChildChildQuerySet
//
// -------------------------


export type ThingChildChildPrefetchKey = 'parent' | { parent: ThingChildPrefetchKey }



export interface ThingChildChildQuerySetLookups {
    id?: number
    id__exact?: number
    id__iexact?: number
    id__gt?: number
    id__gte?: number
    id__lt?: number
    id__lte?: number
    id__in?: number[]
    id__contains?: number
    id__icontains?: number
    id__startswith?: number
    id__istartswith?: number
    id__endswith?: number
    id__iendswith?: number
    id__range?: [number, number]
    id__isnull?: boolean
    id__regex?: number
    id__iregex?: number
    name?: string
    name__exact?: string
    name__iexact?: string
    name__gt?: string
    name__gte?: string
    name__lt?: string
    name__lte?: string
    name__in?: string[]
    name__contains?: string
    name__icontains?: string
    name__startswith?: string
    name__istartswith?: string
    name__endswith?: string
    name__iendswith?: string
    name__range?: [string, string]
    name__isnull?: boolean
    name__regex?: string
    name__iregex?: string
    number?: number
    number__exact?: number
    number__iexact?: number
    number__gt?: number
    number__gte?: number
    number__lt?: number
    number__lte?: number
    number__in?: number[]
    number__contains?: number
    number__icontains?: number
    number__startswith?: number
    number__istartswith?: number
    number__endswith?: number
    number__iendswith?: number
    number__range?: [number, number]
    number__isnull?: boolean
    number__regex?: number
    number__iregex?: number
    parent?: ThingChildQuerySetLookups
}

export class ThingChildChildQuerySet {

    protected lookups: ThingChildChildQuerySetLookups;
    protected excludedLookups: ThingChildChildQuerySetLookups;
    protected _or: ThingChildChildQuerySet[] = [];
    protected _prefetch: ThingChildChildPrefetchKey[];


    constructor(lookups: ThingChildChildQuerySetLookups = {}, excludedLookups: ThingChildChildQuerySetLookups = {}) {
        this.lookups = lookups;
        this.excludedLookups = excludedLookups;
    }

    public prefetch(...prefetchKeys: ThingChildChildPrefetchKey[]): this {
        const existingPrefetch: ThingChildChildPrefetchKey[] = this._prefetch ? (this._prefetch) : ([] as ThingChildChildPrefetchKey[]);
        this._prefetch = [...existingPrefetch, ...prefetchKeys];
        return this
    }

    public static all(): ThingChildChildQuerySet {
        return new ThingChildChildQuerySet()
    }

    public static filter(lookups: Partial<ThingChildChildQuerySetLookups>): ThingChildChildQuerySet {
        return new ThingChildChildQuerySet(lookups)
    }

    public filter(lookups: Partial<ThingChildChildQuerySetLookups>): ThingChildChildQuerySet {
        return new ThingChildChildQuerySet({ ...this.lookups, ...lookups }, this.excludedLookups)
    }

    public static exclude(lookups: Partial<ThingChildChildQuerySetLookups>): ThingChildChildQuerySet {
        return new ThingChildChildQuerySet({}, lookups)
    }

    public exclude(lookups: Partial<ThingChildChildQuerySetLookups>): ThingChildChildQuerySet {
        return new ThingChildChildQuerySet({}, { ...this.excludedLookups, ...lookups })
    }

    public or(queryset: ThingChildChildQuerySet): this {
        this._or.push(queryset);
        return this
    }

    public static async get(primaryKey: number, ...prefetchKeys: ThingChildChildPrefetchKey[]): Promise<ServerPayload<ThingChildChild>> {
        let urlQuery = '';
        if (prefetchKeys) {
            urlQuery += "prefetch=" + JSON.stringify(prefetchKeys)
        }
        let [responseData, statusCode, err] = await serverClient.get(`thing-child-child/${primaryKey}/get/`, urlQuery);
        if (statusCode === 200) {
            return [new ThingChildChild(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public static async create(data: Partial<ThingChildChildFields>): Promise<ServerPayload<ThingChildChild>> {
        let [responseData, statusCode, err] = await serverClient.post(`thing-child-child/create/`, data);

        if (statusCode === 201) {
            return [new ThingChildChild(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public serialize(): object {
        return {
            filters: flattenLookups(this.lookups),
            exclude: flattenLookups(this.excludedLookups),
            or_: this._or.map((queryset) => queryset.serialize())
        }
    }

    public async values(...fields: Array<[keyof ThingChildChildFields]>): Promise<ServerDataPayload<object[]>> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields);
        let [responseData, statusCode, err] = await serverClient.get(`thing-child-child//`, urlQuery);
        return [responseData, statusCode, err]

    }

    public async pageValues(pageNum: number = 1, pageSize: number = 25,
        ...fields: Array<[keyof ThingChildChildFields]>): Promise<ServerDataPayload<PaginatedData<object>>> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields) + "&page=" + pageNum + "&pagesize=" + pageSize;
        let [responseData, statusCode, err] = await serverClient.get(`thing-child-child//`, urlQuery);
        return [responseData, statusCode, err]
    }

    public async retrieve(): Promise<ServerPayload<ThingChildChild[]>> {
        let urlQuery = "query=" + JSON.stringify(this.serialize());
        if (this._prefetch) {
            urlQuery += "&prefetch=" + JSON.stringify(this._prefetch)
        }
        let [responseData, statusCode, err] = await serverClient.get(`thing-child-child//`, urlQuery);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [responseData.map((data) => new ThingChildChild(data)), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public async retrievePage(pageNum: number = 1, pageSize: number = 25): Promise<ServerPayload<PaginatedData<ThingChildChild>>> {
        let urlQuery = "query=" + JSON.stringify(this.serialize()) + "&page=" + pageNum + "&pagesize=" + pageSize;
        if (this._prefetch) {
            urlQuery += "&prefetch=" + JSON.stringify(this._prefetch)
        }
        let [responseData, statusCode, err] = await serverClient.get(`thing-child-child//`, urlQuery);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [{
                ...responseData,
                data: responseData.data.map((data) => new ThingChildChild(data))
            }, responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

}


// -------------------------
// ThingChildChild
//
// -------------------------


export interface ThingChildChildFields {
    readonly id: number
    name?: string
    number?: number
    parent_id: number
}


export class ThingChildChild implements ThingChildChildFields {

    readonly id: number
    name?: string
    number?: number
    parent_id: number
    @foreignKeyField(() => ThingChild) parent?: ThingChild

    public static readonly FIELD_SCHEMAS: ModelFieldsSchema<FieldType> = {
        id: { fieldName: 'id', fieldType: 'AutoField', nullable: false, isReadOnly: true },
        name: { fieldName: 'name', fieldType: 'CharField', nullable: true, isReadOnly: false },
        number: { fieldName: 'number', fieldType: 'IntegerField', nullable: true, isReadOnly: false },
        parent_id: { fieldName: 'parent_id', fieldType: 'IntegerField', nullable: false, isReadOnly: false, relatedModel: () => ThingChild }
    }

    constructor(data: ThingChildChildFields) {
        Object.assign(this, data);
    }

    static objects = ThingChildChildQuerySet;

    public pk(): number {
        return this.id
    }

    public async update(data: Partial<ThingChildChildFields>): Promise<ServerPayload<ThingChildChild>> {
        let [responseData, statusCode, err] = await serverClient.post(`thing-child-child/${this.pk()}/update/`, data);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [new ThingChildChild(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err];
    }

    public async delete() {
        return await serverClient.delete(`thing-child-child/${this.pk()}/delete/`);
    }








}