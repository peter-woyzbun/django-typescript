
// -------------------------
// Primary Key
//
// -------------------------

export type PrimaryKey = number;


// -------------------------
// Field Types
//
// -------------------------

export enum FieldType{
    CharField = "CharField",
    IntegerField = "IntegerField",
    ForeignKey = "ForeignKey",
    OneToOneField = "OneToOneField",
    JSONField = "JSONField",
    ArrayField = "ArrayField",
    FloatField = "FloatField",
    TextField = "TextField",
    BooleanField = "BooleanField",
    DateField = "DateField",
    DateTimeField = "DateTimeField",
    AutoField = "AutoField",
    EncryptedField = "EncryptedField",
    EmailField = "EmailField",
    ManyToManyField = "ManyToManyField",
    PartitionField = "PartitionField",
    NullBooleanField = "NullBooleanField"
}

// -------------------------
// Field Schema
//
// -------------------------


export interface FieldSchema<FieldTypes>{
    readonly fieldName: string;
    readonly fieldType: FieldTypes;
    readonly nullable: boolean;
    readonly isReadOnly: boolean;
    readonly description?: string;
    readonly defaultValue?: any;
    readonly relatedModel?: any;
    readonly choices?: any[]
}

// -------------------------
// Model Fields Schema
//
// -------------------------

export interface ModelFieldsSchema<FieldTypes>{
    [key: string]: FieldSchema<FieldTypes>
}


// -------------------------
// Foreign Key Field
//
// -------------------------

export const foreignKeyField = (RelatedModel: () => any) =>

  function(target: any, propertyKey: string) {



    // Key for retrieving the ID value of this foreign key relation.
    const idPropertyKey = propertyKey + '_id';

    let value = target[propertyKey];
    let cachedValue = null;
    let idValue = target[idPropertyKey];

    const getter = async () => {
        return this[idPropertyKey]
        // const _RelatedModel = RelatedModel();
        // if (value){ return value }
        // if (idValue){
        //     value = await _RelatedModel.objects.get(idValue);
        //     return value
        // }
        // return undefined
    };

    const setter = (val) => {
        cachedValue = val;
    };


    Object.defineProperty(target, propertyKey, {

        get: async function() {
            if (cachedValue){
                return cachedValue
            }
            const _RelatedModel = RelatedModel();
            value = await _RelatedModel.objects.get(this[idPropertyKey]);
            this[propertyKey] = value;
            return value
         },
        set: function (val) {
            cachedValue = val;
        }
    });

  };
