import fetch, {FetchError} from 'node-fetch';


// -------------------------
// Server Types
//
// -------------------------

// DRF status codes
// Source: https://www.django-rest-framework.org/api-guide/status-codes/

export enum SuccessfulHttpStatusCodes{
    HTTP_200_OK = 200,
    HTTP_201_CREATED = 201,
    HTTP_202_ACCEPTED = 202,
    HTTP_203_NON_AUTHORITATIVE_INFORMATION = 203,
    HTTP_204_NO_CONTENT = 204,
    HTTP_205_RESET_CONTENT = 205,
    HTTP_206_PARTIAL_CONTENT = 206,
    HTTP_207_MULTI_STATUS = 207
}

export enum ClientErorrHttpStatusCodes{
    HTTP_400_BAD_REQUEST = 400,
    HTTP_401_UNAUTHORIZED = 401,
    HTTP_402_PAYMENT_REQUIRED = 402,
    HTTP_403_FORBIDDEN = 403,
    HTTP_404_NOT_FOUND = 404,
    HTTP_405_METHOD_NOT_ALLOWED = 405,
    HTTP_406_NOT_ACCEPTABLE = 406,
    HTTP_407_PROXY_AUTHENTICATION_REQUIRED = 407,
    HTTP_408_REQUEST_TIMEOUT = 408,
    HTTP_409_CONFLICT = 409,
    HTTP_410_GONE = 410,
    HTTP_411_LENGTH_REQUIRED = 411,
    HTTP_412_PRECONDITION_FAILED = 412,
    HTTP_413_REQUEST_ENTITY_TOO_LARGE = 413,
    HTTP_414_REQUEST_URI_TOO_LONG = 414,
    HTTP_415_UNSUPPORTED_MEDIA_TYPE = 415,
    HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE = 416,
    HTTP_417_EXPECTATION_FAILED = 417,
    HTTP_422_UNPROCESSABLE_ENTITY = 422,
    HTTP_423_LOCKED = 423,
    HTTP_424_FAILED_DEPENDENCY = 424,
    HTTP_428_PRECONDITION_REQUIRED = 428,
    HTTP_429_TOO_MANY_REQUESTS = 429,
    HTTP_431_REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
    HTTP_451_UNAVAILABLE_FOR_LEGAL_REASONS = 451
}

export enum ServerErrorHttpStatusCodes{
    HTTP_500_INTERNAL_SERVER_ERROR = 500,
    HTTP_501_NOT_IMPLEMENTED = 501,
    HTTP_502_BAD_GATEWAY = 502,
    HTTP_503_SERVICE_UNAVAILABLE = 503,
    HTTP_504_GATEWAY_TIMEOUT = 504,
    HTTP_505_HTTP_VERSION_NOT_SUPPORTED = 505,
    HTTP_507_INSUFFICIENT_STORAGE = 507,
    HTTP_511_NETWORK_AUTHENTICATION_REQUIRED = 511
}

export type HttpStatusCode = SuccessfulHttpStatusCodes | ClientErorrHttpStatusCodes | ServerErrorHttpStatusCodes;

// Structure of data returned by DRF if there is a validation error.
export interface ServerValidationErrors{
    non_field_errors?: string[],
    [fieldName: string]: string[]
}

export interface BulkServerValidationErrors{
    [index: number]: ServerValidationErrors
}

// Structure of data returned by DRF if there is a permission error.
export interface PermissionDeniedData{
    message: string,
}

export type HeaderMiddleware = (header: object) => object;

export enum RequestMethod{
    GET='GET',
    POST='POST',
    PATCH='PATCH',
    DELETE='DELETE'
}

// Generic type for paginated data.
export interface PaginatedData<DataType>{
    num_results: number,
    num_pages: number,
    page: number,
    data: DataType[]
}

// There will be no status code in the event of a FetchError.
export type ResponseStatusCode = HttpStatusCode | undefined;

// There will only be a ResponseError if there is a FetchError.
export type ResponseError = FetchError | undefined;

// There will be no response data in the event of a FetchError.
export type ResponseData = any | undefined;

export type ServerResponse = [ResponseData, ResponseStatusCode, ResponseError]

// A `ServerResponse` type, but with a generic type prepended.
export type ServerPayload<PayloadType> = [PayloadType | undefined, ResponseData, ResponseStatusCode, ResponseError]

// A `ServerResponse` type, but with the ResponseData type generic.
export type ServerDataPayload<PayloadType> = [PayloadType | undefined, ResponseStatusCode, ResponseError]


// -------------------------
// Model Field Types
//
// -------------------------

export interface FieldSchemaChoice{
    value: any
    label: string
}

export interface FieldSchema<FieldTypes>{
    readonly fieldName: string;
    readonly fieldType: FieldTypes;
    readonly nullable: boolean;
    readonly isReadOnly: boolean;
    readonly description?: string;
    readonly defaultValue?: any;
    readonly relatedModel?: () => any;
    readonly choices?: FieldSchemaChoice[]
}

export interface ModelFieldsSchema<FieldTypes>{
    [key: string]: FieldSchema<FieldTypes>
}


// -------------------------
// Abstract Model Types
//
// -------------------------

export interface QuerySetClass<Lookups, M>{
    filter: (lookups: Lookups) => QuerySet<Lookups, M>,
    exclude: (lookups: Lookups) => QuerySet<Lookups, M>,
    get: (primaryKey: number | string) => Promise<ServerPayload<Model>>,
    create: (data: object) => Promise<ServerPayload<Model>>
}

export interface QuerySet<Lookups, M>{
    filter: (lookups: Lookups) => this,
    exclude: (lookups: object) => this,
    or: (queryset: QuerySet<Lookups, M>) => this,
    values: (...fields: string[]) => Promise<ServerDataPayload<object[]>>,
    pageValues: (pageNum: number, pageSize: number) => Promise<ServerDataPayload<PaginatedData<object>>>,
    retrieve: () => Promise<ServerPayload<M[]>>,
    retrievePage: (pageNum: number, pageSize: number) => Promise<ServerPayload<PaginatedData<Model>>>
}


export interface ModelClass<Lookups, Fields, M>{
    objects: QuerySetClass<Lookups, M>,
    FIELD_SCHEMAS: ModelFieldsSchema<any>
}

export interface Model{
    pk: () => number | string,
    delete: () => void,
    update: (data: object) => Promise<ServerPayload<Model>>
}