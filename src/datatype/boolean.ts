import { isBoolean } from "hardcore-react-utils";
import {
  ErrorConstructorMessage,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from "../error";
import { typeOf } from "../utils/type";
import { CoreType, Types } from "./base";

export class BooleanType extends CoreType<boolean> {
  static create = (
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ) => {
    return new BooleanType({
      type: Types.boolean,
      defaultCheckers: [
        (value: any, { ctx: { paths } }) => {
          const valid = isBoolean(value);
          if (valid) return true;

          return new InvalidTypeError({
            expectedType: Types.boolean,
            receivedType: typeOf(value),
            message: error,
            paths,
          });
        },
      ],
    });
  };
}

export const boolean = BooleanType.create;