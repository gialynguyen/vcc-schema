import { mixed, string, number, array } from "../dist";

const UserSchema = mixed({
  name: string(),
  age: number(),
  roleIds: array(string()).default([]),
  detail: mixed({
    email: string(),
    phone: string(),
  }),
});

// UserSchema.errorMessageMap({

// }, { overwrite: true })

// UserSchema.errorMessage()
