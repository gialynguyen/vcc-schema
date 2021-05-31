import { CoreType, Types } from "./base";
import {
  ErrorConstructorMessage,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from "../error";
import { typeOf } from "../utils/type";

export class UndefinedType extends CoreType<undefined> {
  static create = (
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ) => {
    return new UndefinedType({
      type: Types.undefined,
      defaultCheckers: [
        (value: any, { ctx: { paths } }) => {
          const valid = typeof value === "undefined";
          if (valid) return true;

          return new InvalidTypeError({
            expectedType: Types.undefined,
            receivedType: typeOf(value),
            message: error,
            paths,
            prerequisite: true,
          });
        },
      ],
    });
  };
}

export const undefined = UndefinedType.create;
