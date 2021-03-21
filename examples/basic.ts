import { String, Number, Mixed, Model, Array, Boolean } from '../dist';

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
})

const userDataSource = {  };
const user = UserEntity.create(userDataSource);

console.log('user: ', user)