import { mixed, string, number, ErrorSubjects, ErrorSubject } from '../dist';

const UserSchema = mixed({
  name: string(),
  age: number().max(10),
  detail: mixed({
    email: string(),
    phone: string(),
  }),
});

const CreateUserSchema = UserSchema.modify({
  age: (ageSchema) =>
    ageSchema.errorMessage(
      ErrorSubjects.InvalidTypeError,
      ({ expectedType, receivedType }) =>
        `Please enter a value that is ${expectedType} type, not ${receivedType} type`
    ),
});
