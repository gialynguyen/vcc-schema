import { mixed, string, number, ErrorSubjects } from "../dist";

const UserSchema = mixed({
  name: string(),
  age: number(),
  detail: mixed({
    email: string(),
    phone: string(),
  }),
})
  .errorMessage(
    ErrorSubjects.InvalidTypeError,
    ({ expectedType, receivedType }) => {
      console.log("executed");

      return `Nhập ${expectedType} đi, tự nhiên nhập ${receivedType} vậy bro`;
    }
  )
  /**
   * ErrorSubjects.Error: all message type
   */
  .errorMessage(ErrorSubjects.Error, ({}) => {});

UserSchema.parser({
  name: "demo",
  age: "12",
  detail: {
    email: "demo@gmail.com",
    phone: "0336915454",
  },
});
