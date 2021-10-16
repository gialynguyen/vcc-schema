import { mixed, string, number, ErrorSubjects } from '../dist';

const UserSchema = mixed({
  name: string(),
  age: number(),
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

CreateUserSchema.parser({
  name: 'demo',
  age: '12',
  detail: {
    email: 'demo@gmail.com',
    phone: '0336915454',
  },
});
