import { mixed, string, number } from '../dist';

const UserSchema = mixed({
  name: string(),
  age: number()
    .max(10),
  detail: mixed({
    email: string(),
    phone: string().after((phone) => {
			return `+84${phone.slice(1)}`;
		}),
  }),
});

const user = UserSchema.parser({
  name: 'gialynguyen',
  age: 9,
  detail: {
    email: 'gialynguyen@gmail.com',
    phone: '0336915454',
  },
});

console.log('user', user);
