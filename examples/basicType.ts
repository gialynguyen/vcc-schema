import {
  string,
  number,
  mixed,
  oneOf,
  ValueType,
  date,
  ErrorType,
  enumType,
  ErrorSet,
} from '../dist';

const NormalName = string()
  .min(4, 'Tên phải dài hơn 4 ký tự')
  .max(15, 'Tên phải ngắn hơn 15 ký tự');

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
    detail: string().nonempty(),
  }),

  gender: enumType(['Male', 'Female']),

  birthDate: date('ISO').default(() => new Date()),
});

type UserEntity = ValueType<typeof UserModel>;

try {
  const user = UserModel.parser({
    name: 'gialynguyen',
    age: 23,
    email: 'emthanchet@gmail.com',
    addressIds: [1],
    addressDetails: [{ name: 'Gialynguyen123' }],
    address: {
      name: 'GL123123123',
      detail: 'HCM',
    },
    stringOrNumber: 4,
  });

  console.log('user: ', user);
} catch (error) {
  if (error instanceof ErrorSet) {
    const errorObject: ErrorType<UserEntity> = error.format();
    console.log('error: ', JSON.stringify(errorObject, null, 2));
  }
}
