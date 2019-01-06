import { serverClient } from './client'
import { ResponseHandlers } from './core'


// -------------------------
// GenericObjectType
//
// -------------------------


export interface GenericObjectTypeFields {
    value: number
    name: string

}


export class GenericObjectType implements GenericObjectTypeFields {

    value: number
    name: string


    constructor(data: GenericObjectTypeFields) {
        Object.assign(this, data);
    }


    public async object_method(data: { add_value: number }, responseHandlers: ResponseHandlers) {
        const postData = {
            __init__: {
                value: this.value,
                name: this.name
            },
            __args__: data
        }
        return await serverClient.post(`generic-object-type/object-method/`, postData, responseHandlers);
    }

    public async object_method_w_arg_serializers(data: { a_datetime: any }, responseHandlers: ResponseHandlers) {
        const postData = {
            __init__: {
                value: this.value,
                name: this.name
            },
            __args__: data
        }
        return await serverClient.post(`generic-object-type/object-method-w-arg-serializers/`, postData, responseHandlers);
    }



    public static async object_method(data: { add_value: number }, responseHandlers: ResponseHandlers) {
        return await serverClient.post(`generic-object-type/object-method/`, data, responseHandlers);
    }

    public static async object_method_w_arg_serializers(data: { a_datetime: any }, responseHandlers: ResponseHandlers) {
        return await serverClient.post(`generic-object-type/object-method-w-arg-serializers/`, data, responseHandlers);
    }




}