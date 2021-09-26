import { isNumber } from "vcc-utils";
import {
  ErrorConstructorMessage,
  InvalidTypeError,
  InvalidTypeErrorPayload,
  NoEqualError,
  NoEqualErrorPayload,
  SizeErrorPayload,
  TooBigError,
  TooSmallError,
} from "../error";
import { typeOf } from "../utils/type";
import { CoreType, Types } from "./base";

export class NumberType extends CoreType<number> {
  static create = (
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ): NumberType => {
    return new NumberType({
      type: Types.number,
      defaultCheckers: [
        (value: any, { ctx: { paths, throwError } }) => {
          const valid = isNumber(value);
          if (valid) return value;

          return throwError(InvalidTypeError, {
            expectedType: Types.number,
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

  max = (
    maxValue: number,
    error?: ErrorConstructorMessage<SizeErrorPayload>
  ): this => {
    return this._extends({
      checkers: [
        (value: number, { ctx: { paths, throwError } }) => {
          if (value <= maxValue) return value;

          return throwError(TooBigError, {
            expectedSize: maxValue,
            receivedSize: value,
            message: error,
            paths,
            inputData: value,
          });
        },
      ],
    });
  };

  min = (
    minValue: number,
    error?: ErrorConstructorMessage<SizeErrorPayload>
  ): this => {
    return this._extends({
      checkers: [
        (value: number, { ctx: { paths, throwError } }) => {
          if (value >= minValue) return value;

          return throwError(TooSmallError, {
            expectedSize: minValue,
            receivedSize: value,
            message: error,
            paths,
            inputData: value,
          });
        },
      ],
    });
  };

  equal = (
    value: number,
    error?: ErrorConstructorMessage<NoEqualErrorPayload<number>>
  ): this => {
    return this._extends({
      checkers: [
        (data: number, { ctx: { paths, throwError } }) => {
          if (data === value) return value;

          return throwError(NoEqualError, {
            expectedValue: value,
            receivedValue: data,
            message: error as ErrorConstructorMessage<
              NoEqualErrorPayload<unknown>
            >,
            paths,
            inputData: value,
          });
        },
      ],
    });
  };
}

export const number = NumberType.create;
