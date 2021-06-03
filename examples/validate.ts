import { string, number, mixed, oneOf, date, ErrorType } from "../dist";

const NormalName = string()
  .min(4, "Tên phải dài hơn 4 ký tự")
  .max(15, "Tên phải ngắn hơn 15 ký tự");

const UserModel = mixed({
  name: NormalName,

  age: number().optional(),

  email: string().email(),

  addressIds: string().array(),

  addressDetails: mixed({
    name: NormalName,
  }).array(),

  stringOrNumber: oneOf([string(), number().max(5)]),

  address: mixed({
    name: NormalName,
    detail: string(),
  }),

  birthDate: date(),
});

const { data, error } = UserModel.validate({
  name: "gialynguyen",
  age: 23,
  email: "emthanchet@gmail.com",
  addressIds: [],
  addressDetails: [{ name: "Gialynguyen123" }],
  address: {
    name: "GL123123123",
    detail: "Detail",
  },
  stringOrNumber: 4,
  birthDate: new Date("2021-04-30T07:47:24.168Z"),
});

console.log("data: ", data);
console.log("error: ", error?.format());
