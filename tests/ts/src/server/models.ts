import { serverClient } from './client'
import { ResponseHandlers, PaginatedInstances, PaginatedObjects, PrimaryKey, foreignKeyField } from './core'


// -------------------------
// ThingQuerySet
//
// -------------------------

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
    id__isnull?: number
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
    name__isnull?: string
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
    number__isnull?: number
    number__regex?: number
    number__iregex?: number
    children__id?: number
    children__id__exact?: number
    children__id__iexact?: number
    children__id__gt?: number
    children__id__gte?: number
    children__id__lt?: number
    children__id__lte?: number
    children__id__in?: number[]
    children__id__contains?: number
    children__id__icontains?: number
    children__id__startswith?: number
    children__id__istartswith?: number
    children__id__endswith?: number
    children__id__iendswith?: number
    children__id__range?: [number, number]
    children__id__isnull?: number
    children__id__regex?: number
    children__id__iregex?: number
    children__name?: string
    children__name__exact?: string
    children__name__iexact?: string
    children__name__gt?: string
    children__name__gte?: string
    children__name__lt?: string
    children__name__lte?: string
    children__name__in?: string[]
    children__name__contains?: string
    children__name__icontains?: string
    children__name__startswith?: string
    children__name__istartswith?: string
    children__name__endswith?: string
    children__name__iendswith?: string
    children__name__range?: [string, string]
    children__name__isnull?: string
    children__name__regex?: string
    children__name__iregex?: string
    children__number?: number
    children__number__exact?: number
    children__number__iexact?: number
    children__number__gt?: number
    children__number__gte?: number
    children__number__lt?: number
    children__number__lte?: number
    children__number__in?: number[]
    children__number__contains?: number
    children__number__icontains?: number
    children__number__startswith?: number
    children__number__istartswith?: number
    children__number__endswith?: number
    children__number__iendswith?: number
    children__number__range?: [number, number]
    children__number__isnull?: number
    children__number__regex?: number
    children__number__iregex?: number

}

export class ThingQuerySet {

    protected lookups: ThingQuerySetLookups;
    protected excludedLookups: ThingQuerySetLookups;
    protected _or: ThingQuerySet[] = [];


    constructor(lookups: ThingQuerySetLookups = {}, excludedLookups: ThingQuerySetLookups = {}) {
        this.lookups = lookups;
        this.excludedLookups = excludedLookups;

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

    public static async get(primaryKey: PrimaryKey, responseHandlers: ResponseHandlers = {}): Promise<Thing | undefined> {
        let responseData = await serverClient.get(`thing/${primaryKey}/get/`, responseHandlers);
        if (responseData) { return new Thing(responseData) }
        return undefined
    }

    public static async create(data: Partial<ThingFields>, responseHandlers: ResponseHandlers = {}): Promise<Thing | undefined> {
        let responseData = await serverClient.post(`thing/create/`, data, responseHandlers);
        if (responseData) { return new Thing(responseData) }
        return undefined
    }

    public serialize(): object {
        return {
            filters: this.lookups,
            exclude: this.excludedLookups,
            or_: this._or.map((queryset) => queryset.serialize())
        }
    }

    public async values(responseHandlers: ResponseHandlers, ...fields: Array<[keyof ThingFields]>): Promise<object[]> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields);
        return await serverClient.get(`thing/`, responseHandlers, urlQuery);
    }

    public async pageValues(responseHandlers: ResponseHandlers = {}, pageNum: number = 1, pageSize: number = 25,
        ...fields: Array<[keyof ThingFields]>): Promise<PaginatedObjects> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields) + "&page=" + pageNum + "&pagesize=" + pageSize;
        return await serverClient.get(`thing/`, responseHandlers, urlQuery);
    }

    public async retrieve(responseHandlers: ResponseHandlers = {}): Promise<Thing[] | undefined> {
        const urlQuery = "query=" + JSON.stringify(this.serialize());
        let responseData = await serverClient.get(`thing/`, responseHandlers, urlQuery);
        return responseData.map((data) => new Thing(data))
    }

    public async retrievePage(responseHandlers: ResponseHandlers = {}, pageNum: number = 1, pageSize: number = 25,
        ...fields: Array<[keyof ThingFields]>): Promise<PaginatedInstances<Thing>> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields) + "&page=" + pageNum + "&pagesize=" + pageSize;
        let responseData = await serverClient.get(`thing/`, responseHandlers, urlQuery);
        return {
            ...responseData,
            data: responseData.data.map((data) => new Thing(data))
        };
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


    data: ThingFields

    constructor(data: ThingFields) {
        this.data = data;
        Object.assign(this, data);
    }

    static objects = ThingQuerySet;

    public pk(): PrimaryKey {
        return this.id
    }

    public async update(data: Partial<ThingFields>, responseHandlers: ResponseHandlers = {}) {
        let responseData = await serverClient.post(`thing/${this.pk()}/update/`, data, responseHandlers);
        return new Thing(responseData)
    }

    public async delete(responseHandlers: ResponseHandlers = {}) {
        let responseData = await serverClient.delete(`thing/${this.pk()}/delete/`, responseHandlers);
    }

    public children(lookups: ThingChildQuerySetLookups = {}) {
        return new ThingChildQuerySet({ ...lookups, ...{ parent__id: this.pk() } })
    }



    public async thing_method(data: { a: string, b: string }, responseHandlers: ResponseHandlers) {
        return await serverClient.post(`thing/thing-method/${this.pk()}/`, data, responseHandlers);
    }



    public static async thing_static_method(data: { a: string, b: string }, responseHandlers: ResponseHandlers) {
        return await serverClient.post(`thing/thing-static-method/`, data, responseHandlers);
    }




}


// -------------------------
// ThingChildQuerySet
//
// -------------------------

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
    id__isnull?: number
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
    name__isnull?: string
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
    number__isnull?: number
    number__regex?: number
    number__iregex?: number
    parent__id?: number
    parent__id__exact?: number
    parent__id__iexact?: number
    parent__id__gt?: number
    parent__id__gte?: number
    parent__id__lt?: number
    parent__id__lte?: number
    parent__id__in?: number[]
    parent__id__contains?: number
    parent__id__icontains?: number
    parent__id__startswith?: number
    parent__id__istartswith?: number
    parent__id__endswith?: number
    parent__id__iendswith?: number
    parent__id__range?: [number, number]
    parent__id__isnull?: number
    parent__id__regex?: number
    parent__id__iregex?: number
    parent__name?: string
    parent__name__exact?: string
    parent__name__iexact?: string
    parent__name__gt?: string
    parent__name__gte?: string
    parent__name__lt?: string
    parent__name__lte?: string
    parent__name__in?: string[]
    parent__name__contains?: string
    parent__name__icontains?: string
    parent__name__startswith?: string
    parent__name__istartswith?: string
    parent__name__endswith?: string
    parent__name__iendswith?: string
    parent__name__range?: [string, string]
    parent__name__isnull?: string
    parent__name__regex?: string
    parent__name__iregex?: string
    parent__number?: number
    parent__number__exact?: number
    parent__number__iexact?: number
    parent__number__gt?: number
    parent__number__gte?: number
    parent__number__lt?: number
    parent__number__lte?: number
    parent__number__in?: number[]
    parent__number__contains?: number
    parent__number__icontains?: number
    parent__number__startswith?: number
    parent__number__istartswith?: number
    parent__number__endswith?: number
    parent__number__iendswith?: number
    parent__number__range?: [number, number]
    parent__number__isnull?: number
    parent__number__regex?: number
    parent__number__iregex?: number

}

export class ThingChildQuerySet {

    protected lookups: ThingChildQuerySetLookups;
    protected excludedLookups: ThingChildQuerySetLookups;
    protected _or: ThingChildQuerySet[] = [];


    constructor(lookups: ThingChildQuerySetLookups = {}, excludedLookups: ThingChildQuerySetLookups = {}) {
        this.lookups = lookups;
        this.excludedLookups = excludedLookups;

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

    public static async get(primaryKey: PrimaryKey, responseHandlers: ResponseHandlers = {}): Promise<ThingChild | undefined> {
        let responseData = await serverClient.get(`thing-child/${primaryKey}/get/`, responseHandlers);
        if (responseData) { return new ThingChild(responseData) }
        return undefined
    }

    public static async create(data: Partial<ThingChildFields>, responseHandlers: ResponseHandlers = {}): Promise<ThingChild | undefined> {
        let responseData = await serverClient.post(`thing-child/create/`, data, responseHandlers);
        if (responseData) { return new ThingChild(responseData) }
        return undefined
    }

    public serialize(): object {
        return {
            filters: this.lookups,
            exclude: this.excludedLookups,
            or_: this._or.map((queryset) => queryset.serialize())
        }
    }

    public async values(responseHandlers: ResponseHandlers, ...fields: Array<[keyof ThingChildFields]>): Promise<object[]> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields);
        return await serverClient.get(`thing-child/`, responseHandlers, urlQuery);
    }

    public async pageValues(responseHandlers: ResponseHandlers = {}, pageNum: number = 1, pageSize: number = 25,
        ...fields: Array<[keyof ThingChildFields]>): Promise<PaginatedObjects> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields) + "&page=" + pageNum + "&pagesize=" + pageSize;
        return await serverClient.get(`thing-child/`, responseHandlers, urlQuery);
    }

    public async retrieve(responseHandlers: ResponseHandlers = {}): Promise<ThingChild[] | undefined> {
        const urlQuery = "query=" + JSON.stringify(this.serialize());
        let responseData = await serverClient.get(`thing-child/`, responseHandlers, urlQuery);
        return responseData.map((data) => new ThingChild(data))
    }

    public async retrievePage(responseHandlers: ResponseHandlers = {}, pageNum: number = 1, pageSize: number = 25,
        ...fields: Array<[keyof ThingChildFields]>): Promise<PaginatedInstances<ThingChild>> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields) + "&page=" + pageNum + "&pagesize=" + pageSize;
        let responseData = await serverClient.get(`thing-child/`, responseHandlers, urlQuery);
        return {
            ...responseData,
            data: responseData.data.map((data) => new ThingChild(data))
        };
    }

}


// -------------------------
// ThingChild
//
// -------------------------


export interface ThingChildFields {
    parent_id: number
    readonly id: number
    name?: string
    number?: number

}


export class ThingChild implements ThingChildFields {

    parent_id: number
    readonly id: number
    name?: string
    number?: number
    @foreignKeyField(() => Thing) parent


    data: ThingChildFields

    constructor(data: ThingChildFields) {
        this.data = data;
        Object.assign(this, data);
    }

    static objects = ThingChildQuerySet;

    public pk(): PrimaryKey {
        return this.id
    }

    public async update(data: Partial<ThingChildFields>, responseHandlers: ResponseHandlers = {}) {
        let responseData = await serverClient.post(`thing-child/${this.pk()}/update/`, data, responseHandlers);
        return new ThingChild(responseData)
    }

    public async delete(responseHandlers: ResponseHandlers = {}) {
        let responseData = await serverClient.delete(`thing-child/${this.pk()}/delete/`, responseHandlers);
    }








}