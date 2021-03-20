import { String, Number, Mixed, Model, Array } from '../dist';

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
  })
})

const userDataSource = {  };
const user = UserEntity.create(userDataSource);

console.log('user: ', user.detail)