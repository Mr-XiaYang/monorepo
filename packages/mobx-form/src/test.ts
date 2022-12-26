import { Form } from "./form";


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


const a = new Form({
  fields: {
    loginName: {type: "text"},
    password: {
      type: "array", childrenFields: {
        type: "text",
      },
    },
    obj: {
      type: "object",
      childrenFields: {
        field1: {type: "text"},
        field2: {type: "text"},
      },
    },
  },
});


test("test", () => {
  a.fields.password.insert("test01", "last");
  a.fields.password.insert("test02", "last");
  console.log(a.fields.password.value);
  a.fields.password.insert("test03", "last");
  a.fields.password.swapIndex(0, 2);
  console.log(a.fields.password.value);
  console.log(a.fields.password.children.map((child)=> child.changed));




});

