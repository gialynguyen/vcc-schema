import { isString } from "vcc-utils";
import {
  ErrorConstructorMessage,
  IncorrectSizeError,
  InvalidStringFormat,
  InvalidStringFormatPayload,
  InvalidTypeError,
  InvalidTypeErrorPayload,
  SizeErrorPayload,
  TooBigError,
  TooSmallError
} from "../error";
import { typeOf } from "../utils/type";
import { CoreType, Types } from "./base";

// from https://stackoverflow.com/a/46181/1550155
const emailRegex =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

export class StringType extends CoreType<string> {
  static create = (
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ): StringType => {
    return new StringType({
      type: Types.string,
      defaultCheckers: [
        (value: any, { ctx: { paths } }): string | InvalidTypeError => {
          const valid = isString(value);
          if (valid) return value;

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
  ): this => {
    return this._extends({
      checkers: [
        (value: string, { ctx: { paths } }) => {
          if (value.length <= maxLength) return value;

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
  ): this => {
    return this._extends({
      checkers: [
        (value: string, { ctx: { paths } }) => {
          if (value.length >= minLength) return value;

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
  ): this => {
    return this._extends({
      checkers: [
        (value: string, { ctx: { paths } }) => {
          if (value.length === length) return value;

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

  email = (
    error?: ErrorConstructorMessage<InvalidStringFormatPayload>
  ): this => {
    return this._extends({
      checkers: [
        (value: string, { ctx: { paths } }) => {
          if (emailRegex.test(value)) return value;

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

  url = (error?: ErrorConstructorMessage<InvalidStringFormatPayload>): this => {
    return this._extends({
      checkers: [
        (value: string, { ctx: { paths } }) => {
          try {
            new URL(value);
            return value;
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
  ): this => {
    return this._extends({
      checkers: [
        (value: string, { ctx: { paths } }) => {
          if (format.test(value)) return value;

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

  nonempty = (error?: ErrorConstructorMessage<SizeErrorPayload>): this => {
    return this.min(1, error || "Expected no empty");
  };
}

export const string = StringType.create;
