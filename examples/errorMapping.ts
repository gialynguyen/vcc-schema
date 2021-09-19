import { mixed, string, number, array, ErrorSubjects } from "../dist";

const UserSchema = mixed({
  name: string(),
  age: number(),
  roleIds: array(string()).default([]),
  detail: mixed({
    email: string(),
    phone: string(),
  }),
});

UserSchema.errorMessage(ErrorSubjects.TooSmallError, ({}) => {});
