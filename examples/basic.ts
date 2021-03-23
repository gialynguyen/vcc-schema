import { String, Number, Mixed, Model, Array, Boolean, Enum } from '../dist';

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
  gender: Enum({values: ["male", "female", 1, "male", null, false, {a: 1}]})
})

const userDataSource = { gender: null };
const user = UserEntity.create(userDataSource);

console.log('user: ', user)