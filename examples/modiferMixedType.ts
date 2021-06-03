import { mixed, string, number, ValueType } from "../dist";

const UserSchema = mixed({
  name: string(),
  age: number(),
});

const CreateUserSchema = UserSchema.modifiers({
  name: (name) => name.optional(),
});

type CreateUserType = ValueType<typeof CreateUserSchema>;

const UpdateUserSchema = UserSchema.pickAndModifers({
  name: (name) => name.min(3),
});

type UpdateUserPayload = ValueType<typeof UpdateUserSchema>;
