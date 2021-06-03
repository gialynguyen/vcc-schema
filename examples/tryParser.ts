import {
  string,
  number,
  mixed,
  oneOf,
  date,
  NoneDeepPartial,
  ValueType,
} from "../dist";

const NormalName = string()
  .min(4, "Tên phải dài hơn 4 ký tự")
  .max(15, "Tên phải ngắn hơn 15 ký tự");

const UserModel = mixed({
  name: NormalName,

  age: number().optional(),

  addressIds: string().array(),

  addressDetails: mixed({
    name: NormalName,
  }).array(),

  stringOrNumber: oneOf([string(), number().max(5)]),

  // address: mixed({
  //   name: NormalName,
  //   detail: string(),
  // }),

  birthDate: date(),
});

const customer = UserModel.tryParser({
  name: "gialynguyen",
  age: 23,
  addressIds: [1, "abc"],
  addressDetails: [],
  address: {
    name: "GL",
    detail: "Detail",
  },
  stringOrNumber: 4,
  birthDate: new Date("2021-04-30T07:47:24.168Z"),
});

type CustomerTryParserType = NoneDeepPartial<ValueType<typeof UserModel>>;

/*
  value of customer will like this:
  {
    name: 'gialynguyen',
    age: 23,
    addressIds: undefined, // Because, after parsing process, this has errors (first value isn't a string), so addressIds will be undefined.
    addressDetails: [],
    address: { name: 'GL', detail: 'Detail' },
    stringOrNumber: 4,
    birthDate: 2021-04-30T07:47:24.168Z
  }
*/
console.log("customer: ", customer);
