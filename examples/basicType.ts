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
  name: string(),

  addressIds: string().array().noempty(),

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

type UserEntity = ValueType<typeof UserModel>
type UserEntityTryParse = DeepPartial<UserEntity>;

const customer = UserModel.parser({
  age: 10,
  name: "gialynguyen",
  addressIds: [],
  addressDetails: [
    {
      name: 123,
    },
  ],
  address: {
    name: "Gialynguyen",
    detail: "Detail",
  },
  stringOrNumber: 4,
  birthDate: "2021-04-30T07:47:24.168Z",
});

console.log("customer: ", customer);
