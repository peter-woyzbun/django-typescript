import fetch from 'node-fetch';


// -------------------------
// Response Handlers
// -------------------------


type ResponseCallback = (response) => void

type HeaderMiddleware = (header: object) => object

export interface ResponseHandlers {
    [responseCode: number]: ResponseCallback,
    onError?: (err) => any
}

type RequestType = 'GET' | 'POST' | 'PATCH' | 'DELETE'


// -------------------------
// Server Client
//
// -------------------------


export class ServerClient {

    public baseUrl: string;
    public headerMiddleware: HeaderMiddleware;
    public defaultResponseHandlers: ResponseHandlers = {};

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

    private _responseHandlers(responseHandlers: ResponseHandlers={}){
        return {...this.defaultResponseHandlers, ...responseHandlers}
    }

    public request(url, requestOptions: object,
                   responseHandlers: ResponseHandlers = {}): Promise<any | undefined>{

        const _responseHandlers = this._responseHandlers(responseHandlers);

        return ((fetch(url, requestOptions)
                .then(res => {
                    if (res.status in _responseHandlers){
                        _responseHandlers[res.status](res)
                    } else{
                        return res.json()
                    }
                })
                .catch(err => {
                    if (responseHandlers.onError){responseHandlers.onError(err)}
                    return err
                })
        ));
    }

    private _requestOptions(requestType: RequestType, headers?: object, body?: any | undefined): object{
        if (!headers){
            headers = {}
        }
        let requestOptions = {
            method: requestType,
        };
        if (body){requestOptions['body'] = body}
        requestOptions['headers'] = this.headerMiddleware(headers);
        return requestOptions
    }

    /**
     * Send a GET request to given url.
     *
     */
    public async get(url: string, responseHandlers: ResponseHandlers={}, urlQuery?): Promise<any | undefined> {
        return this.request(this._buildUrl(url, urlQuery), this._requestOptions('GET'), responseHandlers);

    }

    /**
     * Send a POST request to given url.
     *
     */
    public async post(url: string, postData?: object, responseHandlers: ResponseHandlers={}): Promise<any | undefined> {
        let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };
        return this.request(this._buildUrl(url), this._requestOptions('POST', headers, JSON.stringify(postData)), responseHandlers);
    }

    /**
     * Send a PATCH request to given url.
     *
     */
    public async patch(url: string, patchData?: object, responseHandlers: ResponseHandlers={}): Promise<any | undefined> {
        return this.request(this._buildUrl(url), this._requestOptions('PATCH', {}, JSON.stringify(patchData)), responseHandlers);
    }

    /**
     * Send a DELETE request to given url.
     *
     */
    public async delete(url: string, postData?: object, responseHandlers: ResponseHandlers={}): Promise<Response | undefined> {
        return this.request(this._buildUrl(url), this._requestOptions('DELETE'), responseHandlers);
    }

    private _buildUrl(url: string, urlQuery?): string {
        let fullUrl = this.baseUrl + url;
        if (urlQuery){
            fullUrl = fullUrl + '?' + urlQuery
        }
        return fullUrl
    }



}
