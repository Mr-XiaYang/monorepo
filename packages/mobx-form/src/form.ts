import { Options } from "@swc/core";
import { makeObservable, observable } from "mobx";
import { ArrayField, ArrayFieldOptions } from "./fields/nested/array";
import { ObjectFieldOptions } from "./fields/nested/object";
import { StringField, StringFieldOptions } from "./fields/string";
import { FormOptions, Form } from "./interface/form";
import { DeepPartial } from "./type";
import { makeFields } from "./utils";

// type Fields<T extends Record<string, any>> = {
//   [K in keyof T]-?: Field<T, T[K]>
// }
//
//
// export type FormOptions<T extends Record<string, any>> = {
//   fields: {
//     [K in keyof T]: FieldOptions<T, T[K]>
//   }
// }
//
//
// export class Form<Options extends FormOptions<Record<string, unknown>>> {
//   readonly options: Options;
//
//   // readonly fields: Fields<T>;
//
//   get valid() {
//     return false;
//   }
//
//   get changed() {
//     return false;
//   }
//
//   get readonly() {
//     return false;
//   }
//
//   get focused() {
//     return false;
//   }
//
//   get blurred() {
//     return false;
//   }
//
//   constructor(options: Options) {
//     this.options = options;
//     // this.fields = makeFields(this, options.fields);
//     makeObservable<this, "fields">(this, {
//       fields: observable,
//     });
//   }
//
//   init(defaultValue: DeepPartial<{}>) {
//   }
//
//   clear() {
//   }
//
//   reset() {
//
//   }
//
//   submit() {
//
//   }
// }
//
// type fieldsConfig<T extends Record<string, any>> = {
//   [K in keyof T]: FieldOptions<T, T[K]>
// }
//
// type MaybeNull<T extends FieldOptions<any, any>, V> =
//   true extends T["allowNull"] ? (null | V) :
//     true extends T["optional"] ? (undefined | V)
//       : V
//
// type fieldType<T extends FieldOptions<any, any>> =
//   T extends StringFieldOptions<any, string> ? MaybeNull<T, string> :
//     T extends ArrayFieldOptions<any, { [k: number]: any }> ? MaybeNull<T, fieldType<T["childrenFields"]>[]> :
//       T extends ObjectFieldOptions<any, { [k: string]: any }> ? MaybeNull<T, { [K in keyof T["childrenFields"]]: fieldType<T["childrenFields"][K]> }> :
//         never
//
// type fieldsType<T extends fieldsConfig<any>> = {
//   [K in keyof T]: fieldType<T[K]>
// }
//
// type fields<T extends fieldsConfig<any>, E extends Record<string, any> = fieldsType<T>> = {
//   [K in keyof T]:
//   T[K] extends StringFieldOptions<any, string> ? StringField<E, fieldType<T[K]>> :
//     T[K] extends ArrayFieldOptions<any, any[]> ? ArrayField<E, fieldType<T[K]>> :
//       never
// }


function makeForm<T extends FormOptions>(config: T): Form<T> {
  return null as any;
}

const a = makeForm({
  fields: {
    loginName: {type: "text", allowNull: true, optional: true},
    password: {
      type: "array", childrenFields: {
        type: "text",
      },
    },
    obj: {
      type: "object",
      allowNull: false,
      optional: false,
      childrenFields: {
        field1: {type: "text", allowNull: false, optional: true},
        field2: {type: "text"},
      },
    },
  },
});

a.fields.obj.children.field1.value




