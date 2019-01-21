import { serverClient } from './client'
import {
    PaginatedData,
    PrimaryKey,
    foreignKeyField,
    dateTimeField,
    ModelFieldsSchema,
    SuccessfulHttpStatusCodes,
    ServerPayload,
    ServerDataPayload
} from './core'

export type FieldType = 'DateTimeField' | 'EmailField' | 'CharField' | 'ForeignKey' | 'ManyToManyField' | 'BooleanField' | 'AutoField' | 'IntegerField'



// -------------------------
// Flatten Lookups
//
// -------------------------

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
// UserQuerySet
//
// -------------------------


export type UserPrefetchKey = never



export interface UserQuerySetLookups {
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
    password?: string
    password__exact?: string
    password__iexact?: string
    password__gt?: string
    password__gte?: string
    password__lt?: string
    password__lte?: string
    password__in?: string[]
    password__contains?: string
    password__icontains?: string
    password__startswith?: string
    password__istartswith?: string
    password__endswith?: string
    password__iendswith?: string
    password__range?: [string, string]
    password__isnull?: boolean
    password__regex?: string
    password__iregex?: string
    last_login?: string
    last_login__exact?: string
    last_login__iexact?: string
    last_login__gt?: string
    last_login__gte?: string
    last_login__lt?: string
    last_login__lte?: string
    last_login__in?: string[]
    last_login__contains?: string
    last_login__icontains?: string
    last_login__startswith?: string
    last_login__istartswith?: string
    last_login__endswith?: string
    last_login__iendswith?: string
    last_login__range?: [string, string]
    last_login__isnull?: boolean
    last_login__regex?: string
    last_login__iregex?: string
    last_login__year?: string
    last_login__month?: string
    last_login__day?: string
    last_login__week_day?: string
    last_login__week?: string
    last_login__quarter?: string
    last_login__hour?: string
    last_login__minute?: string
    last_login__second?: string
    last_login__date?: string
    last_login__time?: string
    is_superuser?: any
    is_superuser__exact?: boolean
    is_superuser__iexact?: boolean
    is_superuser__gt?: boolean
    is_superuser__gte?: boolean
    is_superuser__lt?: boolean
    is_superuser__lte?: boolean
    is_superuser__in?: boolean[]
    is_superuser__contains?: boolean
    is_superuser__icontains?: boolean
    is_superuser__startswith?: boolean
    is_superuser__istartswith?: boolean
    is_superuser__endswith?: boolean
    is_superuser__iendswith?: boolean
    is_superuser__range?: [boolean, boolean]
    is_superuser__isnull?: boolean
    is_superuser__regex?: boolean
    is_superuser__iregex?: boolean
    username?: string
    username__exact?: string
    username__iexact?: string
    username__gt?: string
    username__gte?: string
    username__lt?: string
    username__lte?: string
    username__in?: string[]
    username__contains?: string
    username__icontains?: string
    username__startswith?: string
    username__istartswith?: string
    username__endswith?: string
    username__iendswith?: string
    username__range?: [string, string]
    username__isnull?: boolean
    username__regex?: string
    username__iregex?: string
    first_name?: string
    first_name__exact?: string
    first_name__iexact?: string
    first_name__gt?: string
    first_name__gte?: string
    first_name__lt?: string
    first_name__lte?: string
    first_name__in?: string[]
    first_name__contains?: string
    first_name__icontains?: string
    first_name__startswith?: string
    first_name__istartswith?: string
    first_name__endswith?: string
    first_name__iendswith?: string
    first_name__range?: [string, string]
    first_name__isnull?: boolean
    first_name__regex?: string
    first_name__iregex?: string
    last_name?: string
    last_name__exact?: string
    last_name__iexact?: string
    last_name__gt?: string
    last_name__gte?: string
    last_name__lt?: string
    last_name__lte?: string
    last_name__in?: string[]
    last_name__contains?: string
    last_name__icontains?: string
    last_name__startswith?: string
    last_name__istartswith?: string
    last_name__endswith?: string
    last_name__iendswith?: string
    last_name__range?: [string, string]
    last_name__isnull?: boolean
    last_name__regex?: string
    last_name__iregex?: string
    email?: any
    email__exact?: string
    email__iexact?: string
    email__gt?: string
    email__gte?: string
    email__lt?: string
    email__lte?: string
    email__in?: string[]
    email__contains?: string
    email__icontains?: string
    email__startswith?: string
    email__istartswith?: string
    email__endswith?: string
    email__iendswith?: string
    email__range?: [string, string]
    email__isnull?: boolean
    email__regex?: string
    email__iregex?: string
    is_staff?: any
    is_staff__exact?: boolean
    is_staff__iexact?: boolean
    is_staff__gt?: boolean
    is_staff__gte?: boolean
    is_staff__lt?: boolean
    is_staff__lte?: boolean
    is_staff__in?: boolean[]
    is_staff__contains?: boolean
    is_staff__icontains?: boolean
    is_staff__startswith?: boolean
    is_staff__istartswith?: boolean
    is_staff__endswith?: boolean
    is_staff__iendswith?: boolean
    is_staff__range?: [boolean, boolean]
    is_staff__isnull?: boolean
    is_staff__regex?: boolean
    is_staff__iregex?: boolean
    is_active?: any
    is_active__exact?: boolean
    is_active__iexact?: boolean
    is_active__gt?: boolean
    is_active__gte?: boolean
    is_active__lt?: boolean
    is_active__lte?: boolean
    is_active__in?: boolean[]
    is_active__contains?: boolean
    is_active__icontains?: boolean
    is_active__startswith?: boolean
    is_active__istartswith?: boolean
    is_active__endswith?: boolean
    is_active__iendswith?: boolean
    is_active__range?: [boolean, boolean]
    is_active__isnull?: boolean
    is_active__regex?: boolean
    is_active__iregex?: boolean
    date_joined?: string
    date_joined__exact?: string
    date_joined__iexact?: string
    date_joined__gt?: string
    date_joined__gte?: string
    date_joined__lt?: string
    date_joined__lte?: string
    date_joined__in?: string[]
    date_joined__contains?: string
    date_joined__icontains?: string
    date_joined__startswith?: string
    date_joined__istartswith?: string
    date_joined__endswith?: string
    date_joined__iendswith?: string
    date_joined__range?: [string, string]
    date_joined__isnull?: boolean
    date_joined__regex?: string
    date_joined__iregex?: string
    date_joined__year?: string
    date_joined__month?: string
    date_joined__day?: string
    date_joined__week_day?: string
    date_joined__week?: string
    date_joined__quarter?: string
    date_joined__hour?: string
    date_joined__minute?: string
    date_joined__second?: string
    date_joined__date?: string
    date_joined__time?: string
}

export class UserQuerySet {

    protected lookups: UserQuerySetLookups;
    protected excludedLookups: UserQuerySetLookups;
    protected _or: UserQuerySet[] = [];
    protected _prefetch: UserPrefetchKey[];

    constructor(lookups: UserQuerySetLookups = {}, excludedLookups: UserQuerySetLookups = {}) {
        this.lookups = lookups;
        this.excludedLookups = excludedLookups;
    }

    public prefetch(...prefetchKeys: UserPrefetchKey[]): this {
        const existingPrefetch: UserPrefetchKey[] = this._prefetch ? (this._prefetch) : ([] as UserPrefetchKey[]);
        this._prefetch = [...existingPrefetch, ...prefetchKeys];
        return this
    }

    public static all(): UserQuerySet {
        return new UserQuerySet()
    }

    public static filter(lookups: Partial<UserQuerySetLookups>): UserQuerySet {
        return new UserQuerySet(lookups)
    }

    public filter(lookups: Partial<UserQuerySetLookups>): UserQuerySet {
        return new UserQuerySet({ ...this.lookups, ...lookups }, this.excludedLookups)
    }

    public static exclude(lookups: Partial<UserQuerySetLookups>): UserQuerySet {
        return new UserQuerySet({}, lookups)
    }

    public exclude(lookups: Partial<UserQuerySetLookups>): UserQuerySet {
        return new UserQuerySet({}, { ...this.excludedLookups, ...lookups })
    }

    public or(queryset: UserQuerySet): this {
        this._or.push(queryset);
        return this
    }

    public static async get(primaryKey: number, ...prefetchKeys: UserPrefetchKey[]): Promise<ServerPayload<User>> {
        let urlQuery = '';
        if (prefetchKeys) {
            urlQuery += "prefetch=" + JSON.stringify(prefetchKeys)
        }
        let [responseData, statusCode, err] = await serverClient.get(`user/${primaryKey}/get/`, urlQuery);
        if (statusCode === 200) {
            return [new User(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public static async getOrCreate(lookup: Partial<UserFields>, defaults: Partial<UserFields> = {}): Promise<ServerPayload<[User, boolean]>> {
        const data = { lookup, defaults };
        let [responseData, statusCode, err] = await serverClient.post(`user/get-or-create/`, data);

        if (statusCode === 201) {
            return [[new User(responseData), true], responseData, statusCode, err]
        }
        if (statusCode === 200) {
            return [[new User(responseData), false], responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public static async create(data: Partial<UserFields>): Promise<ServerPayload<User>> {
        let [responseData, statusCode, err] = await serverClient.post(`user/create/`, data);

        if (statusCode === 201) {
            return [new User(responseData), responseData, statusCode, err]
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

    public async values(...fields: Array<[keyof UserFields]>): Promise<ServerDataPayload<object[]>> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields);
        let [responseData, statusCode, err] = await serverClient.get(`user//`, urlQuery);
        return [responseData, statusCode, err]

    }

    public async pageValues(pageNum: number = 1, pageSize: number = 25,
        ...fields: Array<[keyof UserFields]>): Promise<ServerDataPayload<PaginatedData<object>>> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields) + "&page=" + pageNum + "&pagesize=" + pageSize;
        let [responseData, statusCode, err] = await serverClient.get(`user//`, urlQuery);
        return [responseData, statusCode, err]
    }

    public async retrieve(): Promise<ServerPayload<User[]>> {
        let urlQuery = "query=" + JSON.stringify(this.serialize());
        if (this._prefetch) {
            urlQuery += "&prefetch=" + JSON.stringify(this._prefetch)
        }
        let [responseData, statusCode, err] = await serverClient.get(`user//`, urlQuery);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [responseData.map((data) => new User(data)), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public async retrievePage(pageNum: number = 1, pageSize: number = 25): Promise<ServerPayload<PaginatedData<User>>> {
        let urlQuery = "query=" + JSON.stringify(this.serialize()) + "&page=" + pageNum + "&pagesize=" + pageSize;
        if (this._prefetch) {
            urlQuery += "&prefetch=" + JSON.stringify(this._prefetch)
        }
        let [responseData, statusCode, err] = await serverClient.get(`user//`, urlQuery);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [{
                ...responseData,
                data: responseData.data.map((data) => new User(data))
            }, responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

}


// -------------------------
// User
//
// -------------------------


export interface UserFields {
    readonly id: number
    password: string
    last_login?: string
    is_superuser: any
    username: string
    first_name: string
    last_name: string
    email: any
    is_staff: any
    is_active: any
    date_joined: string
}


export class User implements UserFields {

    readonly id: number
    password: string
    last_login?: string
    is_superuser: any
    username: string
    first_name: string
    last_name: string
    email: any
    is_staff: any
    is_active: any
    date_joined: string

    public static readonly FIELD_SCHEMAS: ModelFieldsSchema<FieldType> = {
        id: { fieldName: 'id', fieldType: 'AutoField', nullable: false, isReadOnly: true },
        password: { fieldName: 'password', fieldType: 'CharField', nullable: false, isReadOnly: false },
        last_login: { fieldName: 'last_login', fieldType: 'DateTimeField', nullable: true, isReadOnly: false },
        is_superuser: { fieldName: 'is_superuser', fieldType: 'BooleanField', nullable: false, isReadOnly: false },
        username: { fieldName: 'username', fieldType: 'CharField', nullable: false, isReadOnly: false },
        first_name: { fieldName: 'first_name', fieldType: 'CharField', nullable: false, isReadOnly: false },
        last_name: { fieldName: 'last_name', fieldType: 'CharField', nullable: false, isReadOnly: false },
        email: { fieldName: 'email', fieldType: 'EmailField', nullable: false, isReadOnly: false },
        is_staff: { fieldName: 'is_staff', fieldType: 'BooleanField', nullable: false, isReadOnly: false },
        is_active: { fieldName: 'is_active', fieldType: 'BooleanField', nullable: false, isReadOnly: false },
        date_joined: { fieldName: 'date_joined', fieldType: 'DateTimeField', nullable: false, isReadOnly: false }
    }

    constructor(data: UserFields) {
        Object.assign(this, data);
    }

    static objects = UserQuerySet;

    public pk(): number {
        return this.id
    }

    public async refresh(...prefetchKeys: UserPrefetchKey[]) {
        return UserQuerySet.get(this.pk(), ...prefetchKeys)
    }

    public async update(data: Partial<UserFields>): Promise<ServerPayload<User>> {
        let [responseData, statusCode, err] = await serverClient.post(`user/${this.pk()}/update/`, data);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [new User(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err];
    }

    public async delete() {
        return await serverClient.delete(`user/${this.pk()}/delete/`);
    }

    public polls(lookups: PollQuerySetLookups = {}) {
        return new PollQuerySet({ ...lookups, ...{ owner: { id: this.pk() } } })
    }

    public question_comments(lookups: QuestionCommentQuerySetLookups = {}) {
        return new QuestionCommentQuerySet({ ...lookups, ...{ user: { id: this.pk() } } })
    }







}

// -------------------------
// PollQuerySet
//
// -------------------------


export type PollPrefetchKey = 'owner' | { owner: UserPrefetchKey }



export interface PollQuerySetLookups {
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
    question_text?: string
    question_text__exact?: string
    question_text__iexact?: string
    question_text__gt?: string
    question_text__gte?: string
    question_text__lt?: string
    question_text__lte?: string
    question_text__in?: string[]
    question_text__contains?: string
    question_text__icontains?: string
    question_text__startswith?: string
    question_text__istartswith?: string
    question_text__endswith?: string
    question_text__iendswith?: string
    question_text__range?: [string, string]
    question_text__isnull?: boolean
    question_text__regex?: string
    question_text__iregex?: string
    pub_date?: string
    pub_date__exact?: string
    pub_date__iexact?: string
    pub_date__gt?: string
    pub_date__gte?: string
    pub_date__lt?: string
    pub_date__lte?: string
    pub_date__in?: string[]
    pub_date__contains?: string
    pub_date__icontains?: string
    pub_date__startswith?: string
    pub_date__istartswith?: string
    pub_date__endswith?: string
    pub_date__iendswith?: string
    pub_date__range?: [string, string]
    pub_date__isnull?: boolean
    pub_date__regex?: string
    pub_date__iregex?: string
    pub_date__year?: string
    pub_date__month?: string
    pub_date__day?: string
    pub_date__week_day?: string
    pub_date__week?: string
    pub_date__quarter?: string
    pub_date__hour?: string
    pub_date__minute?: string
    pub_date__second?: string
    pub_date__date?: string
    pub_date__time?: string
    state?: 'OPEN' | 'CLOSED' | 'PAUSED'
    state__exact?: string
    state__iexact?: string
    state__gt?: string
    state__gte?: string
    state__lt?: string
    state__lte?: string
    state__in?: string[]
    state__contains?: string
    state__icontains?: string
    state__startswith?: string
    state__istartswith?: string
    state__endswith?: string
    state__iendswith?: string
    state__range?: [string, string]
    state__isnull?: boolean
    state__regex?: string
    state__iregex?: string
    owner?: UserQuerySetLookups
}

export class PollQuerySet {

    protected lookups: PollQuerySetLookups;
    protected excludedLookups: PollQuerySetLookups;
    protected _or: PollQuerySet[] = [];
    protected _prefetch: PollPrefetchKey[];

    constructor(lookups: PollQuerySetLookups = {}, excludedLookups: PollQuerySetLookups = {}) {
        this.lookups = lookups;
        this.excludedLookups = excludedLookups;
    }

    public prefetch(...prefetchKeys: PollPrefetchKey[]): this {
        const existingPrefetch: PollPrefetchKey[] = this._prefetch ? (this._prefetch) : ([] as PollPrefetchKey[]);
        this._prefetch = [...existingPrefetch, ...prefetchKeys];
        return this
    }

    public static all(): PollQuerySet {
        return new PollQuerySet()
    }

    public static filter(lookups: Partial<PollQuerySetLookups>): PollQuerySet {
        return new PollQuerySet(lookups)
    }

    public filter(lookups: Partial<PollQuerySetLookups>): PollQuerySet {
        return new PollQuerySet({ ...this.lookups, ...lookups }, this.excludedLookups)
    }

    public static exclude(lookups: Partial<PollQuerySetLookups>): PollQuerySet {
        return new PollQuerySet({}, lookups)
    }

    public exclude(lookups: Partial<PollQuerySetLookups>): PollQuerySet {
        return new PollQuerySet({}, { ...this.excludedLookups, ...lookups })
    }

    public or(queryset: PollQuerySet): this {
        this._or.push(queryset);
        return this
    }

    public static async get(primaryKey: number, ...prefetchKeys: PollPrefetchKey[]): Promise<ServerPayload<Poll>> {
        let urlQuery = '';
        if (prefetchKeys) {
            urlQuery += "prefetch=" + JSON.stringify(prefetchKeys)
        }
        let [responseData, statusCode, err] = await serverClient.get(`poll/${primaryKey}/get/`, urlQuery);
        if (statusCode === 200) {
            return [new Poll(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public static async getOrCreate(lookup: Partial<PollFields>, defaults: Partial<PollFields> = {}): Promise<ServerPayload<[Poll, boolean]>> {
        const data = { lookup, defaults };
        let [responseData, statusCode, err] = await serverClient.post(`poll/get-or-create/`, data);

        if (statusCode === 201) {
            return [[new Poll(responseData), true], responseData, statusCode, err]
        }
        if (statusCode === 200) {
            return [[new Poll(responseData), false], responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public static async create(data: Partial<PollFields>): Promise<ServerPayload<Poll>> {
        let [responseData, statusCode, err] = await serverClient.post(`poll/create/`, data);

        if (statusCode === 201) {
            return [new Poll(responseData), responseData, statusCode, err]
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

    public async values(...fields: Array<[keyof PollFields]>): Promise<ServerDataPayload<object[]>> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields);
        let [responseData, statusCode, err] = await serverClient.get(`poll//`, urlQuery);
        return [responseData, statusCode, err]

    }

    public async pageValues(pageNum: number = 1, pageSize: number = 25,
        ...fields: Array<[keyof PollFields]>): Promise<ServerDataPayload<PaginatedData<object>>> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields) + "&page=" + pageNum + "&pagesize=" + pageSize;
        let [responseData, statusCode, err] = await serverClient.get(`poll//`, urlQuery);
        return [responseData, statusCode, err]
    }

    public async retrieve(): Promise<ServerPayload<Poll[]>> {
        let urlQuery = "query=" + JSON.stringify(this.serialize());
        if (this._prefetch) {
            urlQuery += "&prefetch=" + JSON.stringify(this._prefetch)
        }
        let [responseData, statusCode, err] = await serverClient.get(`poll//`, urlQuery);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [responseData.map((data) => new Poll(data)), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public async retrievePage(pageNum: number = 1, pageSize: number = 25): Promise<ServerPayload<PaginatedData<Poll>>> {
        let urlQuery = "query=" + JSON.stringify(this.serialize()) + "&page=" + pageNum + "&pagesize=" + pageSize;
        if (this._prefetch) {
            urlQuery += "&prefetch=" + JSON.stringify(this._prefetch)
        }
        let [responseData, statusCode, err] = await serverClient.get(`poll//`, urlQuery);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [{
                ...responseData,
                data: responseData.data.map((data) => new Poll(data))
            }, responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

}


// -------------------------
// Poll
//
// -------------------------


export interface PollFields {
    readonly id: number
    question_text: string
    pub_date: string
    state: 'OPEN' | 'CLOSED' | 'PAUSED'
    owner_id: number
}


export class Poll implements PollFields {

    readonly id: number
    question_text: string
    pub_date: string
    state: 'OPEN' | 'CLOSED' | 'PAUSED'
    owner_id: number
    @foreignKeyField(() => User) owner?: User

    public static readonly FIELD_SCHEMAS: ModelFieldsSchema<FieldType> = {
        id: { fieldName: 'id', fieldType: 'AutoField', nullable: false, isReadOnly: true },
        question_text: { fieldName: 'question_text', fieldType: 'CharField', nullable: false, isReadOnly: false },
        pub_date: { fieldName: 'pub_date', fieldType: 'DateTimeField', nullable: false, isReadOnly: false },
        state: { fieldName: 'state', fieldType: 'CharField', nullable: false, isReadOnly: false, choices: [{ value: 'OPEN', label: 'Open' }, { value: 'CLOSED', label: 'Closed' }, { value: 'PAUSED', label: 'Paused' }] },
        owner_id: { fieldName: 'owner_id', fieldType: 'IntegerField', nullable: false, isReadOnly: false, relatedModel: () => User }
    }

    constructor(data: PollFields) {
        Object.assign(this, data);
    }

    static objects = PollQuerySet;

    public pk(): number {
        return this.id
    }

    public async refresh(...prefetchKeys: PollPrefetchKey[]) {
        return PollQuerySet.get(this.pk(), ...prefetchKeys)
    }

    public async update(data: Partial<PollFields>): Promise<ServerPayload<Poll>> {
        let [responseData, statusCode, err] = await serverClient.post(`poll/${this.pk()}/update/`, data);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [new Poll(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err];
    }

    public async delete() {
        return await serverClient.delete(`poll/${this.pk()}/delete/`);
    }

    public questions(lookups: QuestionQuerySetLookups = {}) {
        return new QuestionQuerySet({ ...lookups, ...{ poll: { id: this.pk() } } })
    }







}

// -------------------------
// QuestionQuerySet
//
// -------------------------


export type QuestionPrefetchKey = 'poll' | { poll: PollPrefetchKey }



export interface QuestionQuerySetLookups {
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
    question_text?: string
    question_text__exact?: string
    question_text__iexact?: string
    question_text__gt?: string
    question_text__gte?: string
    question_text__lt?: string
    question_text__lte?: string
    question_text__in?: string[]
    question_text__contains?: string
    question_text__icontains?: string
    question_text__startswith?: string
    question_text__istartswith?: string
    question_text__endswith?: string
    question_text__iendswith?: string
    question_text__range?: [string, string]
    question_text__isnull?: boolean
    question_text__regex?: string
    question_text__iregex?: string
    pub_date?: string
    pub_date__exact?: string
    pub_date__iexact?: string
    pub_date__gt?: string
    pub_date__gte?: string
    pub_date__lt?: string
    pub_date__lte?: string
    pub_date__in?: string[]
    pub_date__contains?: string
    pub_date__icontains?: string
    pub_date__startswith?: string
    pub_date__istartswith?: string
    pub_date__endswith?: string
    pub_date__iendswith?: string
    pub_date__range?: [string, string]
    pub_date__isnull?: boolean
    pub_date__regex?: string
    pub_date__iregex?: string
    pub_date__year?: string
    pub_date__month?: string
    pub_date__day?: string
    pub_date__week_day?: string
    pub_date__week?: string
    pub_date__quarter?: string
    pub_date__hour?: string
    pub_date__minute?: string
    pub_date__second?: string
    pub_date__date?: string
    pub_date__time?: string
    poll?: PollQuerySetLookups
}

export class QuestionQuerySet {

    protected lookups: QuestionQuerySetLookups;
    protected excludedLookups: QuestionQuerySetLookups;
    protected _or: QuestionQuerySet[] = [];
    protected _prefetch: QuestionPrefetchKey[];

    constructor(lookups: QuestionQuerySetLookups = {}, excludedLookups: QuestionQuerySetLookups = {}) {
        this.lookups = lookups;
        this.excludedLookups = excludedLookups;
    }

    public prefetch(...prefetchKeys: QuestionPrefetchKey[]): this {
        const existingPrefetch: QuestionPrefetchKey[] = this._prefetch ? (this._prefetch) : ([] as QuestionPrefetchKey[]);
        this._prefetch = [...existingPrefetch, ...prefetchKeys];
        return this
    }

    public static all(): QuestionQuerySet {
        return new QuestionQuerySet()
    }

    public static filter(lookups: Partial<QuestionQuerySetLookups>): QuestionQuerySet {
        return new QuestionQuerySet(lookups)
    }

    public filter(lookups: Partial<QuestionQuerySetLookups>): QuestionQuerySet {
        return new QuestionQuerySet({ ...this.lookups, ...lookups }, this.excludedLookups)
    }

    public static exclude(lookups: Partial<QuestionQuerySetLookups>): QuestionQuerySet {
        return new QuestionQuerySet({}, lookups)
    }

    public exclude(lookups: Partial<QuestionQuerySetLookups>): QuestionQuerySet {
        return new QuestionQuerySet({}, { ...this.excludedLookups, ...lookups })
    }

    public or(queryset: QuestionQuerySet): this {
        this._or.push(queryset);
        return this
    }

    public static async get(primaryKey: number, ...prefetchKeys: QuestionPrefetchKey[]): Promise<ServerPayload<Question>> {
        let urlQuery = '';
        if (prefetchKeys) {
            urlQuery += "prefetch=" + JSON.stringify(prefetchKeys)
        }
        let [responseData, statusCode, err] = await serverClient.get(`question/${primaryKey}/get/`, urlQuery);
        if (statusCode === 200) {
            return [new Question(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public static async getOrCreate(lookup: Partial<QuestionFields>, defaults: Partial<QuestionFields> = {}): Promise<ServerPayload<[Question, boolean]>> {
        const data = { lookup, defaults };
        let [responseData, statusCode, err] = await serverClient.post(`question/get-or-create/`, data);

        if (statusCode === 201) {
            return [[new Question(responseData), true], responseData, statusCode, err]
        }
        if (statusCode === 200) {
            return [[new Question(responseData), false], responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public static async create(data: Partial<QuestionFields>): Promise<ServerPayload<Question>> {
        let [responseData, statusCode, err] = await serverClient.post(`question/create/`, data);

        if (statusCode === 201) {
            return [new Question(responseData), responseData, statusCode, err]
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

    public async values(...fields: Array<[keyof QuestionFields]>): Promise<ServerDataPayload<object[]>> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields);
        let [responseData, statusCode, err] = await serverClient.get(`question//`, urlQuery);
        return [responseData, statusCode, err]

    }

    public async pageValues(pageNum: number = 1, pageSize: number = 25,
        ...fields: Array<[keyof QuestionFields]>): Promise<ServerDataPayload<PaginatedData<object>>> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields) + "&page=" + pageNum + "&pagesize=" + pageSize;
        let [responseData, statusCode, err] = await serverClient.get(`question//`, urlQuery);
        return [responseData, statusCode, err]
    }

    public async retrieve(): Promise<ServerPayload<Question[]>> {
        let urlQuery = "query=" + JSON.stringify(this.serialize());
        if (this._prefetch) {
            urlQuery += "&prefetch=" + JSON.stringify(this._prefetch)
        }
        let [responseData, statusCode, err] = await serverClient.get(`question//`, urlQuery);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [responseData.map((data) => new Question(data)), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public async retrievePage(pageNum: number = 1, pageSize: number = 25): Promise<ServerPayload<PaginatedData<Question>>> {
        let urlQuery = "query=" + JSON.stringify(this.serialize()) + "&page=" + pageNum + "&pagesize=" + pageSize;
        if (this._prefetch) {
            urlQuery += "&prefetch=" + JSON.stringify(this._prefetch)
        }
        let [responseData, statusCode, err] = await serverClient.get(`question//`, urlQuery);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [{
                ...responseData,
                data: responseData.data.map((data) => new Question(data))
            }, responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

}


// -------------------------
// Question
//
// -------------------------


export interface QuestionFields {
    readonly id: number
    question_text: string
    pub_date: string
    poll_id: number
}


export class Question implements QuestionFields {

    readonly id: number
    question_text: string
    pub_date: string
    poll_id: number
    @foreignKeyField(() => Poll) poll?: Poll

    public static readonly FIELD_SCHEMAS: ModelFieldsSchema<FieldType> = {
        id: { fieldName: 'id', fieldType: 'AutoField', nullable: false, isReadOnly: true },
        question_text: { fieldName: 'question_text', fieldType: 'CharField', nullable: false, isReadOnly: false },
        pub_date: { fieldName: 'pub_date', fieldType: 'DateTimeField', nullable: false, isReadOnly: false },
        poll_id: { fieldName: 'poll_id', fieldType: 'IntegerField', nullable: false, isReadOnly: false, relatedModel: () => Poll }
    }

    constructor(data: QuestionFields) {
        Object.assign(this, data);
    }

    static objects = QuestionQuerySet;

    public pk(): number {
        return this.id
    }

    public async refresh(...prefetchKeys: QuestionPrefetchKey[]) {
        return QuestionQuerySet.get(this.pk(), ...prefetchKeys)
    }

    public async update(data: Partial<QuestionFields>): Promise<ServerPayload<Question>> {
        let [responseData, statusCode, err] = await serverClient.post(`question/${this.pk()}/update/`, data);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [new Question(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err];
    }

    public async delete() {
        return await serverClient.delete(`question/${this.pk()}/delete/`);
    }

    public comments(lookups: QuestionCommentQuerySetLookups = {}) {
        return new QuestionCommentQuerySet({ ...lookups, ...{ question: { id: this.pk() } } })
    }

    public choices(lookups: ChoiceQuerySetLookups = {}) {
        return new ChoiceQuerySet({ ...lookups, ...{ question: { id: this.pk() } } })
    }







}

// -------------------------
// QuestionCommentQuerySet
//
// -------------------------


export type QuestionCommentPrefetchKey = 'question' | { question: QuestionPrefetchKey } |
    'user' | { user: UserPrefetchKey }



export interface QuestionCommentQuerySetLookups {
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
    comment?: string
    comment__exact?: string
    comment__iexact?: string
    comment__gt?: string
    comment__gte?: string
    comment__lt?: string
    comment__lte?: string
    comment__in?: string[]
    comment__contains?: string
    comment__icontains?: string
    comment__startswith?: string
    comment__istartswith?: string
    comment__endswith?: string
    comment__iendswith?: string
    comment__range?: [string, string]
    comment__isnull?: boolean
    comment__regex?: string
    comment__iregex?: string
    question?: QuestionQuerySetLookups
    user?: UserQuerySetLookups
}

export class QuestionCommentQuerySet {

    protected lookups: QuestionCommentQuerySetLookups;
    protected excludedLookups: QuestionCommentQuerySetLookups;
    protected _or: QuestionCommentQuerySet[] = [];
    protected _prefetch: QuestionCommentPrefetchKey[];

    constructor(lookups: QuestionCommentQuerySetLookups = {}, excludedLookups: QuestionCommentQuerySetLookups = {}) {
        this.lookups = lookups;
        this.excludedLookups = excludedLookups;
    }

    public prefetch(...prefetchKeys: QuestionCommentPrefetchKey[]): this {
        const existingPrefetch: QuestionCommentPrefetchKey[] = this._prefetch ? (this._prefetch) : ([] as QuestionCommentPrefetchKey[]);
        this._prefetch = [...existingPrefetch, ...prefetchKeys];
        return this
    }

    public static all(): QuestionCommentQuerySet {
        return new QuestionCommentQuerySet()
    }

    public static filter(lookups: Partial<QuestionCommentQuerySetLookups>): QuestionCommentQuerySet {
        return new QuestionCommentQuerySet(lookups)
    }

    public filter(lookups: Partial<QuestionCommentQuerySetLookups>): QuestionCommentQuerySet {
        return new QuestionCommentQuerySet({ ...this.lookups, ...lookups }, this.excludedLookups)
    }

    public static exclude(lookups: Partial<QuestionCommentQuerySetLookups>): QuestionCommentQuerySet {
        return new QuestionCommentQuerySet({}, lookups)
    }

    public exclude(lookups: Partial<QuestionCommentQuerySetLookups>): QuestionCommentQuerySet {
        return new QuestionCommentQuerySet({}, { ...this.excludedLookups, ...lookups })
    }

    public or(queryset: QuestionCommentQuerySet): this {
        this._or.push(queryset);
        return this
    }

    public static async get(primaryKey: number, ...prefetchKeys: QuestionCommentPrefetchKey[]): Promise<ServerPayload<QuestionComment>> {
        let urlQuery = '';
        if (prefetchKeys) {
            urlQuery += "prefetch=" + JSON.stringify(prefetchKeys)
        }
        let [responseData, statusCode, err] = await serverClient.get(`question-comment/${primaryKey}/get/`, urlQuery);
        if (statusCode === 200) {
            return [new QuestionComment(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public static async getOrCreate(lookup: Partial<QuestionCommentFields>, defaults: Partial<QuestionCommentFields> = {}): Promise<ServerPayload<[QuestionComment, boolean]>> {
        const data = { lookup, defaults };
        let [responseData, statusCode, err] = await serverClient.post(`question-comment/get-or-create/`, data);

        if (statusCode === 201) {
            return [[new QuestionComment(responseData), true], responseData, statusCode, err]
        }
        if (statusCode === 200) {
            return [[new QuestionComment(responseData), false], responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public static async create(data: Partial<QuestionCommentFields>): Promise<ServerPayload<QuestionComment>> {
        let [responseData, statusCode, err] = await serverClient.post(`question-comment/create/`, data);

        if (statusCode === 201) {
            return [new QuestionComment(responseData), responseData, statusCode, err]
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

    public async values(...fields: Array<[keyof QuestionCommentFields]>): Promise<ServerDataPayload<object[]>> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields);
        let [responseData, statusCode, err] = await serverClient.get(`question-comment//`, urlQuery);
        return [responseData, statusCode, err]

    }

    public async pageValues(pageNum: number = 1, pageSize: number = 25,
        ...fields: Array<[keyof QuestionCommentFields]>): Promise<ServerDataPayload<PaginatedData<object>>> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields) + "&page=" + pageNum + "&pagesize=" + pageSize;
        let [responseData, statusCode, err] = await serverClient.get(`question-comment//`, urlQuery);
        return [responseData, statusCode, err]
    }

    public async retrieve(): Promise<ServerPayload<QuestionComment[]>> {
        let urlQuery = "query=" + JSON.stringify(this.serialize());
        if (this._prefetch) {
            urlQuery += "&prefetch=" + JSON.stringify(this._prefetch)
        }
        let [responseData, statusCode, err] = await serverClient.get(`question-comment//`, urlQuery);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [responseData.map((data) => new QuestionComment(data)), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public async retrievePage(pageNum: number = 1, pageSize: number = 25): Promise<ServerPayload<PaginatedData<QuestionComment>>> {
        let urlQuery = "query=" + JSON.stringify(this.serialize()) + "&page=" + pageNum + "&pagesize=" + pageSize;
        if (this._prefetch) {
            urlQuery += "&prefetch=" + JSON.stringify(this._prefetch)
        }
        let [responseData, statusCode, err] = await serverClient.get(`question-comment//`, urlQuery);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [{
                ...responseData,
                data: responseData.data.map((data) => new QuestionComment(data))
            }, responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

}


// -------------------------
// QuestionComment
//
// -------------------------


export interface QuestionCommentFields {
    readonly id: number
    comment: string
    question_id: number
    user_id: number
}


export class QuestionComment implements QuestionCommentFields {

    readonly id: number
    comment: string
    question_id: number
    @foreignKeyField(() => Question) question?: Question
    user_id: number
    @foreignKeyField(() => User) user?: User

    public static readonly FIELD_SCHEMAS: ModelFieldsSchema<FieldType> = {
        id: { fieldName: 'id', fieldType: 'AutoField', nullable: false, isReadOnly: true },
        comment: { fieldName: 'comment', fieldType: 'CharField', nullable: false, isReadOnly: false },
        question_id: { fieldName: 'question_id', fieldType: 'IntegerField', nullable: false, isReadOnly: false, relatedModel: () => Question },
        user_id: { fieldName: 'user_id', fieldType: 'IntegerField', nullable: false, isReadOnly: false, relatedModel: () => User }
    }

    constructor(data: QuestionCommentFields) {
        Object.assign(this, data);
    }

    static objects = QuestionCommentQuerySet;

    public pk(): number {
        return this.id
    }

    public async refresh(...prefetchKeys: QuestionCommentPrefetchKey[]) {
        return QuestionCommentQuerySet.get(this.pk(), ...prefetchKeys)
    }

    public async update(data: Partial<QuestionCommentFields>): Promise<ServerPayload<QuestionComment>> {
        let [responseData, statusCode, err] = await serverClient.post(`question-comment/${this.pk()}/update/`, data);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [new QuestionComment(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err];
    }

    public async delete() {
        return await serverClient.delete(`question-comment/${this.pk()}/delete/`);
    }








}

// -------------------------
// ChoiceQuerySet
//
// -------------------------


export type ChoicePrefetchKey = 'question' | { question: QuestionPrefetchKey }



export interface ChoiceQuerySetLookups {
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
    choice_text?: string
    choice_text__exact?: string
    choice_text__iexact?: string
    choice_text__gt?: string
    choice_text__gte?: string
    choice_text__lt?: string
    choice_text__lte?: string
    choice_text__in?: string[]
    choice_text__contains?: string
    choice_text__icontains?: string
    choice_text__startswith?: string
    choice_text__istartswith?: string
    choice_text__endswith?: string
    choice_text__iendswith?: string
    choice_text__range?: [string, string]
    choice_text__isnull?: boolean
    choice_text__regex?: string
    choice_text__iregex?: string
    votes?: number
    votes__exact?: number
    votes__iexact?: number
    votes__gt?: number
    votes__gte?: number
    votes__lt?: number
    votes__lte?: number
    votes__in?: number[]
    votes__contains?: number
    votes__icontains?: number
    votes__startswith?: number
    votes__istartswith?: number
    votes__endswith?: number
    votes__iendswith?: number
    votes__range?: [number, number]
    votes__isnull?: boolean
    votes__regex?: number
    votes__iregex?: number
    question?: QuestionQuerySetLookups
}

export class ChoiceQuerySet {

    protected lookups: ChoiceQuerySetLookups;
    protected excludedLookups: ChoiceQuerySetLookups;
    protected _or: ChoiceQuerySet[] = [];
    protected _prefetch: ChoicePrefetchKey[];

    constructor(lookups: ChoiceQuerySetLookups = {}, excludedLookups: ChoiceQuerySetLookups = {}) {
        this.lookups = lookups;
        this.excludedLookups = excludedLookups;
    }

    public prefetch(...prefetchKeys: ChoicePrefetchKey[]): this {
        const existingPrefetch: ChoicePrefetchKey[] = this._prefetch ? (this._prefetch) : ([] as ChoicePrefetchKey[]);
        this._prefetch = [...existingPrefetch, ...prefetchKeys];
        return this
    }

    public static all(): ChoiceQuerySet {
        return new ChoiceQuerySet()
    }

    public static filter(lookups: Partial<ChoiceQuerySetLookups>): ChoiceQuerySet {
        return new ChoiceQuerySet(lookups)
    }

    public filter(lookups: Partial<ChoiceQuerySetLookups>): ChoiceQuerySet {
        return new ChoiceQuerySet({ ...this.lookups, ...lookups }, this.excludedLookups)
    }

    public static exclude(lookups: Partial<ChoiceQuerySetLookups>): ChoiceQuerySet {
        return new ChoiceQuerySet({}, lookups)
    }

    public exclude(lookups: Partial<ChoiceQuerySetLookups>): ChoiceQuerySet {
        return new ChoiceQuerySet({}, { ...this.excludedLookups, ...lookups })
    }

    public or(queryset: ChoiceQuerySet): this {
        this._or.push(queryset);
        return this
    }

    public static async get(primaryKey: number, ...prefetchKeys: ChoicePrefetchKey[]): Promise<ServerPayload<Choice>> {
        let urlQuery = '';
        if (prefetchKeys) {
            urlQuery += "prefetch=" + JSON.stringify(prefetchKeys)
        }
        let [responseData, statusCode, err] = await serverClient.get(`choice/${primaryKey}/get/`, urlQuery);
        if (statusCode === 200) {
            return [new Choice(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public static async getOrCreate(lookup: Partial<ChoiceFields>, defaults: Partial<ChoiceFields> = {}): Promise<ServerPayload<[Choice, boolean]>> {
        const data = { lookup, defaults };
        let [responseData, statusCode, err] = await serverClient.post(`choice/get-or-create/`, data);

        if (statusCode === 201) {
            return [[new Choice(responseData), true], responseData, statusCode, err]
        }
        if (statusCode === 200) {
            return [[new Choice(responseData), false], responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public static async create(data: Partial<ChoiceFields>): Promise<ServerPayload<Choice>> {
        let [responseData, statusCode, err] = await serverClient.post(`choice/create/`, data);

        if (statusCode === 201) {
            return [new Choice(responseData), responseData, statusCode, err]
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

    public async values(...fields: Array<[keyof ChoiceFields]>): Promise<ServerDataPayload<object[]>> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields);
        let [responseData, statusCode, err] = await serverClient.get(`choice//`, urlQuery);
        return [responseData, statusCode, err]

    }

    public async pageValues(pageNum: number = 1, pageSize: number = 25,
        ...fields: Array<[keyof ChoiceFields]>): Promise<ServerDataPayload<PaginatedData<object>>> {
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields) + "&page=" + pageNum + "&pagesize=" + pageSize;
        let [responseData, statusCode, err] = await serverClient.get(`choice//`, urlQuery);
        return [responseData, statusCode, err]
    }

    public async retrieve(): Promise<ServerPayload<Choice[]>> {
        let urlQuery = "query=" + JSON.stringify(this.serialize());
        if (this._prefetch) {
            urlQuery += "&prefetch=" + JSON.stringify(this._prefetch)
        }
        let [responseData, statusCode, err] = await serverClient.get(`choice//`, urlQuery);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [responseData.map((data) => new Choice(data)), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public async retrievePage(pageNum: number = 1, pageSize: number = 25): Promise<ServerPayload<PaginatedData<Choice>>> {
        let urlQuery = "query=" + JSON.stringify(this.serialize()) + "&page=" + pageNum + "&pagesize=" + pageSize;
        if (this._prefetch) {
            urlQuery += "&prefetch=" + JSON.stringify(this._prefetch)
        }
        let [responseData, statusCode, err] = await serverClient.get(`choice//`, urlQuery);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [{
                ...responseData,
                data: responseData.data.map((data) => new Choice(data))
            }, responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

}


// -------------------------
// Choice
//
// -------------------------


export interface ChoiceFields {
    readonly id: number
    choice_text: string
    votes: number
    question_id: number
}


export class Choice implements ChoiceFields {

    readonly id: number
    choice_text: string
    votes: number
    question_id: number
    @foreignKeyField(() => Question) question?: Question

    public static readonly FIELD_SCHEMAS: ModelFieldsSchema<FieldType> = {
        id: { fieldName: 'id', fieldType: 'AutoField', nullable: false, isReadOnly: true },
        choice_text: { fieldName: 'choice_text', fieldType: 'CharField', nullable: false, isReadOnly: false },
        votes: { fieldName: 'votes', fieldType: 'IntegerField', nullable: false, isReadOnly: false },
        question_id: { fieldName: 'question_id', fieldType: 'IntegerField', nullable: false, isReadOnly: false, relatedModel: () => Question }
    }

    constructor(data: ChoiceFields) {
        Object.assign(this, data);
    }

    static objects = ChoiceQuerySet;

    public pk(): number {
        return this.id
    }

    public async refresh(...prefetchKeys: ChoicePrefetchKey[]) {
        return ChoiceQuerySet.get(this.pk(), ...prefetchKeys)
    }

    public async update(data: Partial<ChoiceFields>): Promise<ServerPayload<Choice>> {
        let [responseData, statusCode, err] = await serverClient.post(`choice/${this.pk()}/update/`, data);
        if (statusCode in SuccessfulHttpStatusCodes) {
            return [new Choice(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err];
    }

    public async delete() {
        return await serverClient.delete(`choice/${this.pk()}/delete/`);
    }








}