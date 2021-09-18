import { string, mixed } from "../dist";

const UserModel = mixed({
  password: string().min(7),
  cPassword: string(),
  user: mixed({
    name: string(),
  })
}).lazy({
  cPassword: {
    checker: (cPassword, { password }) => cPassword === password,
    message: "Nhập lại chưa đúng mật khẩu",
  },
});

UserModel.parser({
  password: "123456789",
  cPassword: "123456",
});
