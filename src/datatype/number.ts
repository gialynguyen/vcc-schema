import { isNumber } from "vcc-utils";
import { CoreType, Types } from "./base";

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

export class NumberType extends CoreType<number> {
  static create = (
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ) => {
    return new NumberType({
      type: Types.number,
      defaultCheckers: [
        (value: any, { ctx: { paths } }) => {
          const valid = isNumber(value);
          if (valid) return true;

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
  ) => {
    return this._extends({
      checkers: [
        (value: number, { ctx: { paths } }) => {
          if (value <= maxValue) return true;

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
  ) => {
    return this._extends({
      checkers: [
        (value: number, { ctx: { paths } }) => {
          if (value >= minValue) return true;

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
  ) => {
    return this._extends({
      checkers: [
        (data: number, { ctx: { paths } }) => {
          if (data === value) return true;

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
