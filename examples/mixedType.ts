import { mixed, string, number, ValueType, array } from "../dist";

const UserSchema = mixed({
  name: string(),
  age: number(),
  roleIds: array(string()).default([]),
  detail: mixed({
    email: string(),
    phone: string(),
  }),
});

UserSchema.parser({
  name: "tom",
  age: 24,
  detail: {
    email: "tom@gmail.com",
    phone: "+8433691545"
  }
})

const CreateUserSchema = UserSchema.modify({
  name: (name) => name.optional(),
});

type CreateUserType = ValueType<typeof CreateUserSchema>;

const UpdateUserSchema = UserSchema.pickAndModify({
  name: (name) => name.min(3),
  age: true,
});

type UpdateUserPayload = ValueType<typeof UpdateUserSchema>;

const BasicInfo = UserSchema.pickBy({
  name: true,
  age: true,
  detail: {
    email: true,
  },
});

const CreateUserPayloadSchema = UserSchema.omitBy({
  roleIds: true,
  detail: {
    phone: true,
  },
});
