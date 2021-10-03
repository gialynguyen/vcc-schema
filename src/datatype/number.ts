import { isNumber } from "vcc-utils";
import {
  ErrorConstructorMessage,
  InvalidTypeError,
  InvalidTypeErrorPayload,
  NoEqualError,
  NoEqualErrorPayload,
  SizeErrorPayload,
  TooBigError,
  TooSmallError
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
        (value: any, { ctx: { paths } }): number | InvalidTypeError => {
          const valid = isNumber(value);
          if (valid) return value;

          return new InvalidTypeError({
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
        (value: number, { ctx: { paths } }) => {
          if (value <= maxValue) return value;

          return new TooBigError({
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
        (value: number, { ctx: { paths } }) => {
          if (value >= minValue) return value;

          return new TooSmallError({
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
        (data: number, { ctx: { paths } }) => {
          if (data === value) return value;

          return new NoEqualError<number>({
            expectedValue: value,
            receivedValue: data,
            message: error,
            paths,
            inputData: value,
          });
        },
      ],
    });
  };
}

export const number = NumberType.create;
