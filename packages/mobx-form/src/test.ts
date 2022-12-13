import { Form } from "./index";


type FormData = {
  loginName: string | null
  password: string
  username: {
    firstName: string
    lastName: string
  }
  tag?: string[]
  children: Array<{
    test?: number
  }>
}

const form = new Form<FormData>({
  fields: {
    loginName: {type: "string", allowNull: true},
    password: {type: "string"},
    username: {
      type: "object",
      children: {
        firstName: {type: "string"},
        lastName: {type: "string"},
      },
    },
    tag: {
      type: "array",
      optional: true,
      childrenFields: {
        type: "string",
      },
    },
    children: {
      type: "array",
      childrenFields: {
        type: "object",
        childrenFields: {
          test: {
            type: "number",
            optional: true,
          },
        },
      },
    },
  },
});

form.init({
  loginName: "",
  password: "",
});


// form.fields.tag.


