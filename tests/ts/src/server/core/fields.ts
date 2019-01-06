
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


export interface FieldSchema{
    readonly fieldName: string;
    readonly fieldType: FieldType;
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

export interface ModelFieldsSchema{
    [key: string]: FieldSchema
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
    let idValue = target[idPropertyKey];

    const getter = async () => {
        const _RelatedModel = RelatedModel();
        if (value){ return value }
        if (idValue){
            value = await _RelatedModel.objects.get(idValue);
            return value
        }
        return undefined
    };

    const setter = (val) => {
        const _RelatedModel = RelatedModel();
        if (val instanceof _RelatedModel){
            value = val
        } else if (typeof val === 'number'){
            idValue = val
        } else {
            value = undefined;
            idValue = undefined;
        }
    };


    Object.defineProperty(target, propertyKey, {
        get: getter,
        set: setter
    });

  };
