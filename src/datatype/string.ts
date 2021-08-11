import { isString } from "vcc-utils";
import { Types, CoreType } from "./base";

import {
  ErrorConstructorMessage,
  IncorrectSizeError,
  InvalidStringFormat,
  InvalidStringFormatPayload,
  InvalidTypeError,
  InvalidTypeErrorPayload,
  SizeErrorPayload,
  TooBigError,
  TooSmallError,
} from "../error";

import { typeOf } from "../utils/type";

// from https://stackoverflow.com/a/46181/1550155
const emailRegex =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

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
            prerequisite: true,
            inputData: value,
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
        (value: string, { ctx: { paths } }) => {
          if (value.length <= maxLength) return true;

          return new TooBigError({
            expectedSize: maxLength,
            receivedSize: value.length,
            message: error,
            paths,
            inputData: value,
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
        (value: string, { ctx: { paths } }) => {
          if (value.length >= minLength) return true;

          return new TooSmallError({
            expectedSize: minLength,
            receivedSize: value.length,
            message: error,
            paths,
            inputData: value,
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
        (value: string, { ctx: { paths } }) => {
          if (value.length === length) return true;

          return new IncorrectSizeError({
            expectedSize: length,
            receivedSize: value.length,
            message: error,
            paths,
            inputData: value,
          });
        },
      ],
    });
  };

  email = (error?: ErrorConstructorMessage<InvalidStringFormatPayload>) => {
    return this._extends({
      checkers: [
        (value: string, { ctx: { paths } }) => {
          if (emailRegex.test(value)) return true;

          return new InvalidStringFormat({
            receivedString: value,
            formatName: "email",
            message: error,
            paths,
            inputData: value,
          });
        },
      ],
    });
  };

  url = (error?: ErrorConstructorMessage<InvalidStringFormatPayload>) => {
    return this._extends({
      checkers: [
        (value: string, { ctx: { paths } }) => {
          try {
            new URL(value);
            return true;
          } catch (e) {
            return new InvalidStringFormat({
              receivedString: value,
              formatName: "url",
              message: error,
              paths,
              inputData: value,
            });
          }
        },
      ],
    });
  };

  regex = (
    format: RegExp,
    formatName?: string,
    error?: ErrorConstructorMessage<InvalidStringFormatPayload>
  ) => {
    return this._extends({
      checkers: [
        (value: string, { ctx: { paths } }) => {
          if (format.test(value)) return true;

          return new InvalidStringFormat({
            receivedString: value,
            formatName: formatName || `string (should like ${format})`,
            message: error,
            paths,
            inputData: value,
          });
        },
      ],
    });
  };

  nonempty = (error?: ErrorConstructorMessage<SizeErrorPayload>) => {
    return this.min(1, error || "Expected no empty");
  };
}

export const string = StringType.create;
