import { serverClient } from './client'


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


    public async object_method(data: { add_value: number }) {


        const postData = {
            __init__: {
                value: this.value,
                name: this.name
            },
            __args__: data
        }


        return await serverClient.post(`generic-object-type/object-method/`, postData);
    }

    public async object_method_w_arg_serializers(data: { a_datetime: string }) {


        const postData = {
            __init__: {
                value: this.value,
                name: this.name
            },
            __args__: data
        }


        return await serverClient.post(`generic-object-type/object-method-w-arg-serializers/`, postData);
    }


    public static async object_static_method(data: { a: string, b: string }) {
        return await serverClient.post(`generic-object-type/object-static-method/`, data);
    }

}