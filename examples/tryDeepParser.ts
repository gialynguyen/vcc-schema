import {
  string,
  number,
  mixed,
  oneOf,
  date,
  DeepPartial,
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

  address: mixed({
    name: NormalName,
    detail: string(),
  }),

  birthDate: date(),
});

const customer = UserModel.tryDeepParser({
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

type CustomerTryParserType = DeepPartial<ValueType<typeof UserModel>>;

/*
	value of customer will like this:
	{
	  name: 'gialynguyen',
		age: 23,
		addressIds: [undefined, 'abc' ],
		addressDetails: [],
		address: { name: undefined, detail: 'Detail' },
		stringOrNumber: 4,
		birthDate: 2021-04-30T07:47:24.168Z
	}
*/
console.log("customer: ", customer);
