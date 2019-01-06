

/*<
// -------------------------
// {{ queryset_name }}
//
// -------------------------
>*/

export interface __$lookups_interface_name__ {
    /*<
    {{ queryset_lookups }}
    >*/
}

export class __$queryset_name__ {

    protected lookups: __$lookups_interface_name__;
    protected excludedLookups: __$lookups_interface_name__;
    protected _or: __$queryset_name__[] = [];


    constructor(lookups: __$lookups_interface_name__ = {}, excludedLookups: __$lookups_interface_name__ = {}){
        this.lookups = lookups;
        this.excludedLookups = excludedLookups;

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

    public static async get(primaryKey: PrimaryKey, responseHandlers: ResponseHandlers={} ): Promise<__$model_name__ | undefined>{
        let responseData = await serverClient.get(`'{{ get_url }}'`, responseHandlers);
        if (responseData){return new __$model_name__(responseData)}
        return undefined
    }

    public static async create(data: Partial<__$field_interface_name__>, responseHandlers: ResponseHandlers={}): Promise< __$model_name__ | undefined>{
        let responseData = await serverClient.post(`'{{ create_url }}'`, data, responseHandlers);
        if (responseData){return new __$model_name__(responseData)}
        return undefined
    }

    public serialize(): object{
        return {
            filters: this.lookups,
            exclude: this.excludedLookups,
            or_: this._or.map((queryset) => queryset.serialize())
        }
    }

    public async values(responseHandlers: ResponseHandlers, ...fields: Array<[keyof __$field_interface_name__]>): Promise<object[]>{
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields);
        return await serverClient.get(`'{{ list_url}}'`, responseHandlers, urlQuery);
    }

    public async pageValues(responseHandlers: ResponseHandlers={}, pageNum: number = 1, pageSize: number = 25,
                            ...fields: Array<[keyof __$field_interface_name__]>): Promise<PaginatedObjects>{
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields) + "&page=" + pageNum + "&pagesize=" + pageSize;
        return await serverClient.get(`'{{ list_url}}'`, responseHandlers, urlQuery);
    }

    public async retrieve(responseHandlers: ResponseHandlers={}): Promise<__$model_name__[] | undefined>{
        const urlQuery = "query=" + JSON.stringify(this.serialize());
        let responseData = await serverClient.get(`'{{ list_url}}'`, responseHandlers, urlQuery);
        return responseData.map((data) => new __$model_name__(data) )
    }

    public async retrievePage(responseHandlers: ResponseHandlers={}, pageNum: number = 1, pageSize: number = 25,
                              ...fields: Array<[keyof __$field_interface_name__]>): Promise<PaginatedInstances<__$model_name__>>{
        const urlQuery = "query=" + JSON.stringify(this.serialize()) + "&fields=" + JSON.stringify(fields) + "&page=" + pageNum + "&pagesize=" + pageSize;
        let responseData = await serverClient.get(`'{{ list_url}}'`, responseHandlers, urlQuery);
        return {
            ...responseData,
            data: responseData.data.map((data) => new __$model_name__(data) )
        };
    }

}


/*<
// -------------------------
// {{ model_name }}
//
// -------------------------
>*/


export interface __$field_interface_name__ {
    /*<
    {{ model_interface_types }}
    >*/
}


export class __$model_name__ implements __$field_interface_name__{

    /*<
    {{ model_class_types }}
    >*/

    data: __$field_interface_name__

    constructor(data: __$field_interface_name__){
        this.data = data;
        Object.assign(this, data);
    }

    static objects = __$queryset_name__;

    public pk(): PrimaryKey{
        /*< return  this.{{ pk_field_name }}  >*/
    }

    public async update(data: Partial<__$field_interface_name__>, responseHandlers: ResponseHandlers = {}){
        let responseData = await serverClient.post(`'{{ update_url}}'`, data, responseHandlers);
        return new __$model_name__(responseData)
    }

    public async delete(responseHandlers: ResponseHandlers = {}){
        let responseData = await serverClient.delete(`'{{ delete_url }}'`, responseHandlers);
    }

     /*<
     {% for reverse_relation in reverse_relations %}
      public {{ reverse_relation.model_field.name }}(lookups: {{ reverse_relation.related_model_name }}QuerySetLookups = {}){
           return new {{ reverse_relation.related_model_name }}QuerySet({...lookups, ...{ {{ reverse_relation.reverse_lookup_key }}: this.pk()}})
      }
      {% endfor %}
    >*/

     /*<
     {% for method in methods %}
      public async {{ method.name }}(data: {{ method.sig_interface }}, responseHandlers: ResponseHandlers){
           return await serverClient.post(`{{ method.url}}`, data, responseHandlers);
      }
      {% endfor %}
    >*/

     /*<
     {% for static_method in static_methods %}
      public static async {{ static_method.name }}(data: {{ static_method.sig_interface }}, responseHandlers: ResponseHandlers){
           return await serverClient.post(`{{ static_method.url}}`, data, responseHandlers);
      }
      {% endfor %}
    >*/


}