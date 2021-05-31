import { CoreType, Types } from "./base";

import {
  ErrorConstructorMessage,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from "../error";
import { isNull } from "vcc-utils";
import { typeOf } from "../utils/type";

export class AnyType extends CoreType<any> {
  static create = (
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ) => {
    return new AnyType({
      type: Types.any,
      defaultCheckers: [
        (value: any, { ctx: { paths } }) => {
          const valid = !isNull(value) && typeof value !== "undefined";
          if (valid) return true;

          return new InvalidTypeError({
            expectedType: Types.any,
            receivedType: typeOf(value),
            message: error,
            paths,
          });
        },
      ],
    });
  };
}

export const any = AnyType.create;
