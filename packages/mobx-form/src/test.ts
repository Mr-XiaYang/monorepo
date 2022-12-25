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

const form = new Form({
  fields: {
    loginName: {type: "string", optional: false, allowNull: true},
    password: {type: "string", variant: "password"},
    username: {
      type: "object",
      childrenFields: {
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


test("test", () => {
  form.init({
    loginName: "",
    password: "",
  });

  console.log(form);
});

