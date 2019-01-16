/*<
// -------------------------
// {{ object_name }}
//
// -------------------------
>*/


export interface __$field_interface_name__ {
    /*< {{ object_interface_types }} >*/
}


export class __$object_name__ implements __$field_interface_name__{

    /*<{{ object_class_types }}>*/

    constructor(data: __$field_interface_name__){
        Object.assign(this, data);
    }

     /*<{% for method in methods %}
      public async {{ method.name }}(data: {{ method.sig_interface }}){
           const postData = {
                __init__: {
                {{ init_mapping }}
                },
                __args__: data
           }
           return await serverClient.post(`{{ method.url}}`, postData);
      }
      {% endfor %}>*/

     /*<{% for static_method in static_methods %}
      public static async {{ static_method.name }}(data: {{ static_method.sig_interface }}){
           return await serverClient.post(`{{ static_method.url}}`, data);
      }
      {% endfor %}>*/
}