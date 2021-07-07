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

  email = (error?: ErrorConstructorMessage<InvalidStringFormatPayload>) => {
    return this._extends({
      checkers: [
        (data: string, { ctx: { paths } }) => {
          if (emailRegex.test(data)) return true;

          return new InvalidStringFormat({
            receivedString: data,
            formatName: "email",
            message: error,
            paths,
          });
        },
      ],
    });
  };

  url = (error?: ErrorConstructorMessage<InvalidStringFormatPayload>) => {
    return this._extends({
      checkers: [
        (data: string, { ctx: { paths } }) => {
          try {
            new URL(data);
            return true;
          } catch (e) {
            return new InvalidStringFormat({
              receivedString: data,
              formatName: "url",
              message: error,
              paths,
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
        (data: string, { ctx: { paths } }) => {
          if (format.test(data)) return true;

          return new InvalidStringFormat({
            receivedString: data,
            formatName: formatName || `string (should like ${format})`,
            message: error,
            paths,
          });
        },
      ],
    });
  };

  noempty = (error?: ErrorConstructorMessage<SizeErrorPayload>) => {
    return this.min(1, error || "Expected no empty");
  };
}

export const string = StringType.create;
