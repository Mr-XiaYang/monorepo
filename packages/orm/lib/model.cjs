'use strict';

var console = require('console');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var console__namespace = /*#__PURE__*/_interopNamespaceDefault(console);

const isSavedSymbol = Symbol("isSavedSymbol");
const isModifiedSymbol = Symbol("isModifiedSymbol");
const dataSymbol = Symbol("dataSymbol");
const modifiedDataSymbol = Symbol("modifiedDataSymbol");
class BaseModel {
    reset() {
        this[modifiedDataSymbol] = {};
    }
    toObject() {
        return {
            ...this
        };
    }
    constructor(data = {}){
        Object.defineProperties(this, {
            [dataSymbol]: {
                enumerable: false,
                configurable: false,
                writable: true,
                value: data
            },
            [modifiedDataSymbol]: {
                enumerable: false,
                configurable: false,
                writable: true,
                value: {}
            },
            [isSavedSymbol]: {
                enumerable: false,
                configurable: false,
                writable: true,
                value: false
            },
            [isModifiedSymbol]: {
                enumerable: false,
                configurable: false,
                get () {
                    return this[isSavedSymbol] && !!Object.keys(this[modifiedDataSymbol]).length;
                }
            }
        });
    }
}
function defineModel(name, definition) {
    class Model extends BaseModel {
        constructor(...args){
            super(...args);
            const propertyDescriptors = {};
            for (let key of Object.keys(Model.definition.fields)){
                const fieldKey = key;
                const fieldOptions = Model.definition.fields[fieldKey];
                const isReadonly = fieldOptions.readonly || !!fieldOptions?.generator || !!fieldOptions?.getter;
                propertyDescriptors[key] = {
                    enumerable: true,
                    configurable: false,
                    set: isReadonly ? undefined : function(value) {
                        if (this[key] !== value) {
                            if (this[isSavedSymbol]) {
                                this[modifiedDataSymbol][fieldKey] = value;
                            } else {
                                this[dataSymbol][fieldKey] = value;
                            }
                        }
                    },
                    get: function() {
                        return fieldOptions.getter?.apply(this) ?? this[modifiedDataSymbol][fieldKey] ?? this[dataSymbol][fieldKey] ?? (typeof fieldOptions.defaultValue === "function" ? fieldOptions.defaultValue() : fieldOptions.defaultValue) ?? null;
                    }
                };
            }
            Object.defineProperties(this, propertyDescriptors);
        }
    }
    Model.definition = definition;
    Object.defineProperty(Model, "name", {
        value: name
    });
    return Model;
}
const User = defineModel("User", {
    database: "oh_test",
    table: "t_user",
    fields: {
        id: {
            primary: true,
            type: "string",
            prefix: "01_"
        },
        gender: {
            column: "gender",
            type: "enum",
            defaultValue: "UNKNOWN",
            values: {
                UNKNOWN: "UNKNOWN",
                MALE: "MALE",
                FEMALE: "FEMALE"
            }
        },
        isMale: {
            type: "string",
            getter () {
                return this.gender === "MALE";
            }
        },
        status: {
            type: "enum",
            required: true,
            values: {
                NONACTIVE: "NONACTIVE",
                ACTIVE: "ACTIVE",
                DISABLE: "DISABLE",
                DELETED: "DELETED"
            }
        },
        createAt: {
            type: "datetime"
        }
    }
});
const user = new User({
    status: "NONACTIVE"
});
user[isSavedSymbol] = true;
// console.log(User);
console__namespace.log(user.id);
user.id = "10";
user.id = "10";
console__namespace.log(user.id);
user.reset();
user.gender = "MALE";
console__namespace.log(user.id);
console__namespace.log(user.isMale);

exports.defineModel = defineModel;
