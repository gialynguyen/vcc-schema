import { isNull } from "vcc-utils";
import { CoreType, Types } from "./base";

import { typeOf } from "../utils/type";
import {
  ErrorConstructorMessage,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from "../error";

export class NullType extends CoreType<null> {
  static create = (
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ) => {
    return new NullType({
      type: Types.null,
      defaultCheckers: [
        (value: any, { ctx: { paths } }) => {
          const valid = isNull(value);
          if (valid) return true;

          return new InvalidTypeError({
            expectedType: Types.null,
            receivedType: typeOf(value),
            message: error,
            paths,
          });
        },
      ],
    });
  };
}

export const nullable = NullType.create;
