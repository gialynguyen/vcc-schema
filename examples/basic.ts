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
  gender: Enum({typeValues: ["male", "female", 1, "male"]})
})

const userDataSource = { gender: "male" };
const user = UserEntity.create(userDataSource);

console.log('user: ', user)