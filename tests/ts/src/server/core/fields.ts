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



    const syncGet = () => {
        return cachedValue
    }

    Object.defineProperty(target, propertyKey, {

        get: function() {
            if (cachedValue){
                return cachedValue
            }
            const asyncGet = async () => {
                    const idValue = this[idPropertyKey];
            if (idValue){
                const _RelatedModel = RelatedModel();
            [value] = await _RelatedModel.objects.get(this[idPropertyKey]);
            this[propertyKey] = value;
            return value
            }
            };
            return asyncGet()
         },
        set: function (val) {
            const _RelatedModel = RelatedModel();
            if (val instanceof _RelatedModel){
                cachedValue = val;
            } else {
                if (typeof val ==='object'){
                    cachedValue = new _RelatedModel(val);
                }
            }

        }
    });

  };
