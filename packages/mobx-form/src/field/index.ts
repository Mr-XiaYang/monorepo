import { Form as FormInterface } from "../form";
import { ArrayField, ArrayFieldOptions } from "./array";
import { IntegerField, IntegerFieldOptions } from "./integer";
import { MultipleSelectorField, MultipleSelectorFieldOptions } from "./multiple_selector";
import { ObjectField, ObjectFieldOptions } from "./object";
import { PasswordField, PasswordFieldOptions } from "./password";
import { RichTextField, RichTextFieldOptions } from "./rich_text";
import { SelectorField, SelectorFieldOptions } from "./selector";
import { SwitchField, SwitchFieldOptions } from "./switch";
import { TextField, TextFieldOptions } from "./text";

export type FieldOptions =
  | TextFieldOptions
  | PasswordFieldOptions
  | RichTextFieldOptions
  | IntegerFieldOptions
  | SwitchFieldOptions
  | SelectorFieldOptions
  | MultipleSelectorFieldOptions
  | ArrayFieldOptions
  | ObjectFieldOptions

type MaybeUndefined<T extends FieldOptions, V> = T["optional"] extends true ? (undefined | V) : V
type MaybeNull<T extends FieldOptions, V> = T["allowNull"] extends true ? (null | V) : V
type MaybeNullOrUndefined<T extends FieldOptions, V> = MaybeUndefined<T, MaybeNull<T, V>>

export type FieldValue<Options> =
  Options extends TextFieldOptions ? MaybeUndefined<Options, string> :
    Options extends PasswordFieldOptions ? MaybeNullOrUndefined<Options, string> :
      Options extends RichTextFieldOptions ? MaybeNullOrUndefined<Options, unknown> :
        Options extends IntegerFieldOptions ? MaybeNullOrUndefined<Options, number> :
          Options extends SwitchFieldOptions ? MaybeNullOrUndefined<Options, boolean> :
            Options extends SelectorFieldOptions ? MaybeNullOrUndefined<Options, Options["availableValues"][0][1]> :
              Options extends MultipleSelectorFieldOptions ? MaybeNullOrUndefined<Options, Options["availableValues"][0][1][]> :
                Options extends ArrayFieldOptions ? MaybeNullOrUndefined<Options, Array<FieldValue<Options["childrenFields"]>>> :
                  Options extends ObjectFieldOptions ? MaybeNullOrUndefined<Options, { [K in keyof Options["childrenFields"]]: FieldValue<Options["childrenFields"][K]> }> :
                    never

export type FieldType<Form extends FormInterface<any>, Options extends FieldOptions> =
  Options extends TextFieldOptions ? TextField<Form, Options> :
    Options extends PasswordFieldOptions ? PasswordField<Form, Options> :
      Options extends RichTextFieldOptions ? RichTextField<Form, Options> :
        Options extends IntegerFieldOptions ? IntegerField<Form, Options> :
          Options extends SwitchFieldOptions ? SwitchField<Form, Options> :
            Options extends SelectorFieldOptions ? SelectorField<Form, Options> :
              Options extends MultipleSelectorFieldOptions ? MultipleSelectorField<Form, Options> :
                Options extends ArrayFieldOptions ? ArrayField<Form, Options> :
                  Options extends ObjectFieldOptions ? ObjectField<Form, Options> :
                    never
