import fetch, {FetchError} from 'node-fetch';

import {HeaderMiddleware, RequestMethod, ServerResponse} from "./types";


// -------------------------
// Server Client
//
// -------------------------


export class ServerClient {

    public baseUrl: string;
    public headerMiddleware: HeaderMiddleware;

    constructor() {
        this.baseUrl = '';
        this.headerMiddleware = (header) => header
    }

    public setup(baseUrl: string, headerMiddleware?: HeaderMiddleware){
        this.baseUrl = baseUrl;
        if (headerMiddleware){
            this.headerMiddleware = headerMiddleware;
        }
    }

    public request(url, requestOptions: object): Promise<ServerResponse>{

        return ((fetch(url, requestOptions)
                .then(async res => {
                    return [await res.json(), res.status, undefined]
                })
                .catch(err => {
                    return [undefined, undefined, err]
                })
        ));
    }

    private _requestOptions(requestMethod: RequestMethod, headers?: object, body?: any | undefined): object{
        if (!headers){
            headers = {}
        }
        let requestOptions = {
            method: requestMethod,
        };
        if (body){requestOptions['body'] = body}
        requestOptions['headers'] = this.headerMiddleware(headers);
        return requestOptions
    }

    /**
     * Send a GET request to given url.
     *
     */
    public async get(url: string, urlQuery?): Promise<ServerResponse>{
        return this.request(this._buildUrl(url, urlQuery), this._requestOptions(RequestMethod.GET));

    }

    /**
     * Send a POST request to given url.
     *
     */
    public async post(url: string, postData?: object, urlQuery?) {
        let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };
        return this.request(this._buildUrl(url, urlQuery), this._requestOptions(RequestMethod.POST, headers, JSON.stringify(postData)));
    }

    /**
     * Send a PATCH request to given url.
     *
     */
    public async patch(url: string, patchData?: object) {
        return this.request(this._buildUrl(url), this._requestOptions(RequestMethod.PATCH, {}, JSON.stringify(patchData)));
    }

    /**
     * Send a DELETE request to given url.
     *
     */
    public async delete(url: string, postData?: object) {
        return this.request(this._buildUrl(url), this._requestOptions(RequestMethod.DELETE));
    }

    private _buildUrl(url: string, urlQuery?): string {
        let fullUrl = this.baseUrl + url;
        if (urlQuery){
            fullUrl = fullUrl + '?' + urlQuery
        }
        return fullUrl
    }
}

// -------------------------
// List Query
//
// -------------------------

export class ListQuery {

    private prefetchKeys;
    private fields;
    private query;
    private pageNum;
    private pageSize;


    constructor(prefetchKeys?: Array<string | object>, fields?: string[], query?: object, pageNum?: number,
                pageSize?: number) {
        this.prefetchKeys = prefetchKeys;
        this.fields = fields;
        this.query = query;
        this.pageNum = pageNum;
        this.pageSize = pageSize;
    }

    urlString(){
        let urlString = '';
        if (this.query){urlString += 'query=' + JSON.stringify(this.query)}
        if (this.fields){urlString += 'fields=' + JSON.stringify(this.fields)}
        if (this.prefetchKeys){urlString += 'prefetch=' + JSON.stringify(this.fields)}
    }

}


const buildUrlQuery = (paramValues: object) => {
    let urlQuery = ''

}
