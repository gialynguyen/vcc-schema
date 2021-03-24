import { String, Number, Mixed, Model, Array, Boolean, Enum, DateType } from '../dist';

const UserEntity = new Model({
  name: String(),
  age: Number(),
  addresses: Array(String()),
  detail: Mixed({
    phone: String(),
    family: Array(
      Mixed({
        name: String(),
        age: Number()
      })
    )
  }),
  married: Boolean(),
  gender: Enum({values: ["male", "female", 1, "male", null, false, {a: 1}]}),
  birthday: DateType()
})

const userDataSource = {};
const user = UserEntity.create(userDataSource);

console.log('user: ', user)