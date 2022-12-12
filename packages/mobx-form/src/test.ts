import { Form } from "./index";


type FormData = {
  loginName: string
  password: string
  username: {
    firstName: string
    lastName: string
  }
  tag: string[]
  children: Array<{
    test: number
  }>
}

const form = new Form<FormData>({
  fields: {
    loginName: {type: "string"},
    password: {type: "string"},
    username: {
      type: "object",
      fields: {
        firstName: {type: "string"},
        lastName: {type: "string"},
      },
    },
    tag: {
      type: "array",
      fields: {
        type: "string",
      },
    },
    children: {
      type: "array",
      fields: {
        type: "object",
        fields: {
          test: {
            type: "number",
          },
        },
      },
    },
  },
});

console.log(form.fields.loginName.value);
