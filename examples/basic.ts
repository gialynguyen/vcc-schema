import {
  String,
  Number,
  Mixed,
  Model,
  Array,
  Boolean,
  Enum,
  DateType,
  ModelType,
} from '../dist';

const AddressModel = new Model({
  name: String(),
});

const UserModel = new Model({
  name: String(),
  age: Number(),
  detail: Mixed({
    phone: String(),
    family: Array(
      Mixed({
        name: String(),
        age: Number(),
      })
    ),
  }),
  married: Boolean(),
  gender: Enum({
    values: ['male', 'female', 1, 'male', null, false, { a: 1 }],
  }),
  birthday: DateType(),
  primaryAddress: ModelType(AddressModel),
  addresses: Array(ModelType(AddressModel)),
});

const userDataSource = {};
const user = UserModel.create(userDataSource);

console.log('user: ', user.addresses);
