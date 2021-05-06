import {
  string,
  number,
  mixed,
  oneOf,
  ValueType,
  date,
  DeepPartial,
} from "../dist";

const UserModel = mixed({
  age: number().optional(),
  name: string()
    .min(4, { errorMessage: "Tên phải dài hơn 4 ký tự" })
    .max(15, { errorMessage: "Tên phải ngắn hơn 15 ký tự" }),

  addressIds: string()
    .array(),

  addressDetails: mixed({
    name: string(),
  }).array(),

  stringOrNumber: oneOf([string(), number().max(5)]),
  address: mixed({
    name: string(),
    detail: string(),
  }),
  birthDate: date(),
});

type UserEntity = ValueType<typeof UserModel>;

type UserEntityTryParse = DeepPartial<UserEntity>;

const customer = UserModel.silentParser({
  age: 23,
  name: "gialynguyen",
  addressIds: [],
  addressDetails: [],
  address: {
    name: "Gialynguyen",
    detail: "Detail",
  },
  stringOrNumber: 4,
  birthDate: "2021-04-30T07:47:24.168Z",
});

console.log("customer: ", customer.error?.errors[0].message);
