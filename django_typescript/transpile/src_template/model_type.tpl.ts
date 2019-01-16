
/*<
// -------------------------
// {{ queryset_name }}
//
// -------------------------
>*/


export type __$prefetch_type_name__ = '{{ prefetch_type }}'



export interface __$lookups_interface_name__ {
    /*<{{ queryset_lookups }}>*/
}

export class __$queryset_name__ {

    protected lookups: __$lookups_interface_name__;
    protected excludedLookups: __$lookups_interface_name__;
    protected _or: __$queryset_name__[] = [];
    protected _prefetch: __$prefetch_type_name__[];


    constructor(lookups: __$lookups_interface_name__ = {}, excludedLookups: __$lookups_interface_name__ = {}){
        this.lookups = lookups;
        this.excludedLookups = excludedLookups;
    }

    public prefetch(...prefetchKeys: __$prefetch_type_name__[]): this{
        const existingPrefetch: __$prefetch_type_name__[] = this._prefetch ? (this._prefetch) : ([] as __$prefetch_type_name__[]);
        this._prefetch = [...existingPrefetch, ...prefetchKeys];
        return this
    }

    public static all(): __$queryset_name__{
        return new __$queryset_name__()
    }

    public static filter(lookups: Partial<__$lookups_interface_name__>): __$queryset_name__{
        return new __$queryset_name__(lookups)
    }

    public filter(lookups: Partial<__$lookups_interface_name__>): __$queryset_name__{
        return new __$queryset_name__({...this.lookups, ...lookups}, this.excludedLookups)
    }

     public static exclude(lookups: Partial<__$lookups_interface_name__>): __$queryset_name__{
        return new __$queryset_name__({}, lookups)
    }

    public exclude(lookups: Partial<__$lookups_interface_name__>): __$queryset_name__{
        return new __$queryset_name__({}, {...this.excludedLookups, ...lookups})
    }

     public or(queryset: __$queryset_name__): this{
        this._or.push(queryset);
        return this
    }

    public static async get(primaryKey: __$pk_type__, ...prefetchKeys: __$prefetch_type_name__[]): Promise<ServerPayload<__$model_name__>>{
        let urlQuery = '';
        if (prefetchKeys){
            urlQuery += "prefetch=" + JSON.stringify(prefetchKeys)
        }
        let [responseData, statusCode, err] = await serverClient.get(`'{{ get_url }}'`, urlQuery);
        if (statusCode === 200){
            return [new __$model_name__(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public static async create(data: Partial<__$field_interface_name__>): Promise<ServerPayload<__$model_name__>>{
        let [responseData, statusCode, err] = await serverClient.post(`'{{ create_url }}'`, data);

        if (statusCode === 201){
            return [new __$model_name__(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public serialize(): object{
        return {
            filters: flattenLookups(this.lookups),
            exclude: flattenLookups(this.excludedLookups),
            or_: this._or.map((queryset) => queryset.serialize())
        }
    }

    public async values(...fields: Array<[keyof __$field_interface_name__]>): Promise<ServerDataPayload<object[]>>{
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields);
        let [responseData, statusCode, err] = await serverClient.get(`'{{ list_url}}'`, urlQuery);
        return [responseData, statusCode, err]

    }

    public async pageValues(pageNum: number = 1, pageSize: number = 25,
                            ...fields: Array<[keyof __$field_interface_name__]>): Promise<ServerDataPayload<PaginatedData<object>>>{
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields) + "&page=" + pageNum + "&pagesize=" + pageSize;
        let [responseData, statusCode, err] = await serverClient.get(`'{{ list_url}}'`, urlQuery);
        return [responseData, statusCode, err]
    }

    public async retrieve(): Promise<ServerPayload<__$model_name__[]>>{
        let urlQuery = "query=" + JSON.stringify(this.serialize());
        if (this._prefetch){
            urlQuery += "&prefetch=" + JSON.stringify(this._prefetch)
        }
        let [responseData, statusCode, err]= await serverClient.get(`'{{ list_url}}'`, urlQuery);
        if (statusCode in SuccessfulHttpStatusCodes){
            return [responseData.map((data) => new __$model_name__(data) ), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

    public async retrievePage(pageNum: number = 1, pageSize: number = 25): Promise<ServerPayload<PaginatedData<__$model_name__>>>{
        let urlQuery = "query=" + JSON.stringify(this.serialize()) + "&page=" + pageNum + "&pagesize=" + pageSize;
        if (this._prefetch){
            urlQuery += "&prefetch=" + JSON.stringify(this._prefetch)
        }
        let [responseData, statusCode, err] = await serverClient.get(`'{{ list_url}}'`, urlQuery);
        if (statusCode in SuccessfulHttpStatusCodes){
            return [{
            ...responseData,
            data: responseData.data.map((data) => new __$model_name__(data) )
        }, responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err]
    }

}


/*<
// -------------------------
// {{ model_name }}
//
// -------------------------
>*/


export interface __$field_interface_name__ {
    /*<{{ model_interface_types }}>*/
}


export class __$model_name__ implements __$field_interface_name__{

    /*<{{ model_class_types }}>*/

    public static readonly FIELD_SCHEMAS: ModelFieldsSchema<FieldType> = {
         /*<{{ field_schemas }}>*/
    }

    constructor(data: __$field_interface_name__){
        Object.assign(this, data);
    }

    static objects = __$queryset_name__;

    public pk(): __$pk_type__{
        /*< return  this.{{ pk_field_name }}  >*/
    }

    public async update(data: Partial<__$field_interface_name__>): Promise<ServerPayload<__$model_name__>>{
        let [responseData, statusCode, err] = await serverClient.post(`'{{ update_url}}'`, data);
         if (statusCode in SuccessfulHttpStatusCodes){
            return [new __$model_name__(responseData), responseData, statusCode, err]
        }
        return [undefined, responseData, statusCode, err];
    }

    public async delete(){
        return await serverClient.delete(`'{{ delete_url }}'`);
    }

     /*<{% for reverse_relation in reverse_relations %}
      public {{ reverse_relation.name }}(lookups: {{ reverse_relation.lookups_type }} = {}){
           return new {{ reverse_relation.queryset_name }}({...lookups, ...{ {{ reverse_relation.lookup_key }}: this.pk()}})
      }
      {% endfor %}>*/

     /*<{% for method in methods %}
      public async {{ method.name }}({{ method.sig_interface }}){
           return await serverClient.post(`{{ method.url}}`, {{ 'data' if method.sig_interface else '{}' }});
      }
      {% endfor %}>*/

     /*<{% for static_method in static_methods %}
      public static async {{ static_method.name }}({{ static_method.sig_interface }}){
           return await serverClient.post(`{{ static_method.url}}`, data);
      }
      {% endfor %}>*/


}