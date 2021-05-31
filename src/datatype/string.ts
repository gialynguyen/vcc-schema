import { isString } from "vcc-utils";
import { Types, CoreType } from "./base";

import {
  ErrorConstructorMessage,
  IncorrectSizeError,
  InvalidTypeError,
  InvalidTypeErrorPayload,
  SizeErrorPayload,
  TooBigError,
  TooSmallError,
} from "../error";

import { typeOf } from "../utils/type";

export class StringType extends CoreType<string> {
  static create = (
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ) => {
    return new StringType({
      type: Types.string,
      defaultCheckers: [
        (value: any, { ctx: { paths } }) => {
          const valid = isString(value);
          if (valid) return true;

          return new InvalidTypeError({
            expectedType: Types.string,
            receivedType: typeOf(value),
            message: error,
            paths,
          });
        },
      ],
    });
  };

  max = (
    maxLength: number,
    error?: ErrorConstructorMessage<SizeErrorPayload>
  ) => {
    return this._extends({
      checkers: [
        (data: string, { ctx: { paths } }) => {
          if (data.length <= maxLength) return true;

          return new TooBigError({
            expectedSize: maxLength,
            receivedSize: data.length,
            message: error,
            paths,
          });
        },
      ],
    });
  };

  min = (
    minLength: number,
    error?: ErrorConstructorMessage<SizeErrorPayload>
  ) => {
    return this._extends({
      checkers: [
        (data: string, { ctx: { paths } }) => {
          if (data.length >= minLength) return true;

          return new TooSmallError({
            expectedSize: minLength,
            receivedSize: data.length,
            message: error,
            paths,
          });
        },
      ],
    });
  };

  length = (
    length: number,
    error?: ErrorConstructorMessage<SizeErrorPayload>
  ) => {
    return this._extends({
      checkers: [
        (data: string, { ctx: { paths } }) => {
          if (data.length === length) return true;

          return new IncorrectSizeError({
            expectedSize: length,
            receivedSize: data.length,
            message: error,
            paths,
          });
        },
      ],
    });
  };
}

export const string = StringType.create;
