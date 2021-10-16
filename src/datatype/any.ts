import { isNull } from "vcc-utils";
import {
  ErrorConstructorMessage,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from "../error";
import { typeOf } from "../utils/type";
import { CoreType, Types } from "./base";
export class AnyType extends CoreType<any> {
  static create = (
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ): AnyType => {
    return new AnyType({
      type: Types.any,
      defaultCheckers: [
        (value: any, { ctx: { paths, throwError } }) => {
          const valid = !isNull(value) && typeof value !== "undefined";
          if (valid) return value;

          return throwError(InvalidTypeError, {
            expectedType: Types.any,
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

export const any = AnyType.create;
