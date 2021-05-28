import {
  string,
  number,
  mixed,
  oneOf,
  ValueType,
  date,
  DeepPartial,
} from "../dist";

const NormalName = string()
  .min(4, "Tên phải dài hơn 4 ký tự")
  .max(15, "Tên phải ngắn hơn 15 ký tự");

const UserModel = mixed({
  age: number().optional(),
  name: NormalName,

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

type UserEntity = ValueType<typeof UserModel>;

type UserEntityTryParse = DeepPartial<UserEntity>;

const customer = UserModel.parser({
  age: 23,
  name: "gialynguyen",
  addressIds: [],
  addressDetails: [],
  address: {
    name: "GL",
    detail: "Detail",
  },
  stringOrNumber: 4,
  birthDate: new Date("2021-04-30T07:47:24.168Z"),
});
