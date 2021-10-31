import { pipe } from 'vcc-utils';
import { mixed, string, number } from '../dist';

const UserSchema = mixed({
  name: string(),
  age: number()
    .max(10)
    .before(
      pipe(
        (input) => Number(input),
        (input) => {
          if (input > 10) {
            return 5;
          }

          return input;
        }
      )
    ),
  detail: mixed({
    email: string(),
    phone: string(),
  }),
});

const user = UserSchema.parser({
  name: 'gialynguyen',
  age: '12',
  detail: {
    email: 'gialynguyen@gmail.com',
    phone: '0336915454',
  },
});

console.log('user', user);
