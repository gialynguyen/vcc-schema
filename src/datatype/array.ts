import { CoreType, Types, ValueType } from "./base";

import {
  ErrorConstructorMessage,
  ErrorSubject,
  InvalidTypeError,
  InvalidTypeErrorPayload,
  SizeErrorPayload,
  TooSmallError,
  IncorrectSizeError,
  TooBigError,
} from "../error";
import { typeOf } from "../utils/type";

export class ArrayType<Item extends CoreType<any>> extends CoreType<
  ValueType<Item>[]
> {
  static create = <Item extends CoreType<any>>(
    elementType: Item,
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ) => {
    return new ArrayType<Item>({
      type: Types.array,
      defaultCheckers: [
        (value: any, { ctx }) => {
          const isValidArray = Array.isArray(value);
          if (isValidArray) return value;

          return new InvalidTypeError({
            expectedType: Types.array,
            receivedType: typeOf(value),
            message: error,
            paths: ctx.paths,
            prerequisite: true,
            inputData: value,
          });
        },
        (value: any, { ctx }) => {
          const returnValue = value;
          let errors: ErrorSubject[] = [];
          const throwOnFirstError = ctx.throwOnFirstError && !ctx.tryParser;

          for (let index = 0; index < value.length; index++) {
            const rawItem = value[index];
            const rawItemOrError: any = elementType.parser(rawItem, {
              deepTryParser: ctx.deepTryParser,
              tryParser: ctx.deepTryParser ? ctx.tryParser : false,
              paths: [...ctx.paths, index],
              nestedParser: true,
              throwOnFirstError: ctx.throwOnFirstError,
            });

            if (ErrorSubject.isArrayErrorSubject(rawItemOrError)) {
              errors = errors.concat(rawItemOrError);
              if (ctx.tryParser) returnValue[index] = undefined;
              if (throwOnFirstError) break;
            } else {
              returnValue[index] = rawItemOrError;
            }
          }

          if (errors.length && !ctx.tryParser) {
            return errors;
          }

          return returnValue;
        },
      ],
    });
  };

  length(length: number, error?: ErrorConstructorMessage<SizeErrorPayload>) {
    return this._extends({
      checkers: [
        (value: Array<any>) => {
          if (value.length === length) return value;
          return new IncorrectSizeError({
            expectedSize: length,
            receivedSize: value.length,
            message: error,
            inputData: value,
          });
        },
      ],
    });
  }

  min(length: number, error?: ErrorConstructorMessage<SizeErrorPayload>) {
    return this._extends({
      checkers: [
        (value: Array<any>) => {
          if (value.length >= length) return value;

          return new TooSmallError({
            expectedSize: length,
            receivedSize: value.length,
            message: error,
            inputData: value,
          });
        },
      ],
    });
  }

  max(length: number, error?: ErrorConstructorMessage<SizeErrorPayload>) {
    return this._extends({
      checkers: [
        (value: Array<any>) => {
          if (value.length <= length) return value;
          return new TooBigError({
            expectedSize: length,
            receivedSize: value.length,
            message: error,
            inputData: value,
          });
        },
      ],
    });
  }

  nonempty(error?: ErrorConstructorMessage<SizeErrorPayload>) {
    return this._extends({
      checkers: [
        (value: Array<any>) => {
          if (value.length > 0) return value;
          return new TooSmallError({
            expectedSize: 1,
            receivedSize: value.length,
            message: error || "Expected no empty",
            inputData: value,
          });
        },
      ],
    });
  }
}

export const array = ArrayType.create;
