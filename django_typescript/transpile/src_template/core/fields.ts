import {ModelClass} from "./types";


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
// Model Fields Schema
//
// -------------------------


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

    Object.defineProperty(target, propertyKey, {

        get: async function() {
            if (cachedValue){
                return cachedValue
            }
            const idValue = this[idPropertyKey];
            if (idValue){
                const _RelatedModel = RelatedModel();
            [value] = await _RelatedModel.objects.get(this[idPropertyKey]);
            this[propertyKey] = value;
            return value
            }
         },
        set: function (val) {
            cachedValue = val;
        }
    });

  };
