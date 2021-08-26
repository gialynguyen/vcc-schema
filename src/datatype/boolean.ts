import { isBoolean } from "vcc-utils";
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
          if (valid) return value;

          return new InvalidTypeError({
            expectedType: Types.boolean,
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

export const boolean = BooleanType.create;
