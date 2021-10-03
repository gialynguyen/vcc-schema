import { isNull } from "vcc-utils";
import {
  ErrorConstructorMessage,
  InvalidTypeError,
  InvalidTypeErrorPayload
} from "../error";
import { typeOf } from "../utils/type";
import { CoreType, Types } from "./base";


export class NullType extends CoreType<null> {
  static create = (
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ): NullType => {
    return new NullType({
      type: Types.null,
      defaultCheckers: [
        (value: any, { ctx: { paths } }): null | InvalidTypeError => {
          const valid = isNull(value);
          if (valid) return value;

          return new InvalidTypeError({
            expectedType: Types.null,
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

export const nullable = NullType.create;
