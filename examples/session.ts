import {
  string,
  number,
  mixed,
  oneOf,
  date,
  Observer,
  record,
  tuples,
} from "../dist";

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

  history: record(string()),

  template: tuples([number(), string()]),
});

const observer = new Observer<typeof UserModel>();

observer.on(
  (representor) => representor.addressDetails,
  ({ data, error }) => {
    
  }
);

observer.onError(
  (representor) => representor.addressDetails,
  (error) => {
    console.log("error: ", error);
  },
);

observer.onSuccess(
  (representor) => representor.addressDetails,
  (data) => {
    console.log("data: ", data);
  }
);
