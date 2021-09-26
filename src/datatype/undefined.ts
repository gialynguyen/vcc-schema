import {
  ErrorConstructorMessage,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from "../error";
import { typeOf } from "../utils/type";
import { CoreType, Types } from "./base";

export class UndefinedType extends CoreType<undefined> {
  static create = (
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ): UndefinedType => {
    return new UndefinedType({
      type: Types.undefined,
      defaultCheckers: [
        (value: any, { ctx: { paths, throwError } }) => {
          const valid = typeof value === "undefined";
          if (valid) return value;

          return throwError(InvalidTypeError, {
            expectedType: Types.undefined,
            receivedType: typeOf(value),
            message: error,
            paths,
            prerequisite: true,
            inputData: value,
          });
        },
      ],
    });
  };
}

export const undefinedType = UndefinedType.create;
