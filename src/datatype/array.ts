import {
  ErrorConstructorMessage,
  ErrorSubject,
  IncorrectSizeError,
  InvalidTypeError,
  InvalidTypeErrorPayload,
  SizeErrorPayload,
  TooBigError,
  TooSmallError,
} from "../error";
import { typeOf } from "../utils/type";
import { CoreType, Types, ValueType } from "./base";

export class ArrayType<Item extends CoreType<any>> extends CoreType<
  ValueType<Item>[]
> {
  static create = <Item extends CoreType<any>>(
    elementType: Item,
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ): ArrayType<Item> => {
    return new ArrayType<Item>({
      type: Types.array,
      defaultCheckers: [
        (value: any, { ctx }) => {
          const isValidArray = Array.isArray(value);
          if (isValidArray) return value;

          return ctx.throwError(InvalidTypeError, {
            expectedType: Types.array,
            receivedType: typeOf(value),
            message: error,
            paths: ctx.paths,
            prerequisite: true,
            inputData: value,
          });
        },
        (value: any, { ctx }): ErrorSubject[] | ValueType<Item>[] => {
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

  length(
    length: number,
    error?: ErrorConstructorMessage<SizeErrorPayload>
  ): this {
    return this._extends({
      checkers: [
        (value: Array<any>, { ctx }) => {
          if (value.length === length) return value;
          return ctx.throwError(IncorrectSizeError, {
            expectedSize: length,
            receivedSize: value.length,
            message: error,
            inputData: value,
          });
        },
      ],
    });
  }

  min(length: number, error?: ErrorConstructorMessage<SizeErrorPayload>): this {
    return this._extends({
      checkers: [
        (value: Array<any>, { ctx }) => {
          if (value.length >= length) return value;

          return ctx.throwError(TooSmallError, {
            expectedSize: length,
            receivedSize: value.length,
            message: error,
            inputData: value,
          });
        },
      ],
    });
  }

  max(length: number, error?: ErrorConstructorMessage<SizeErrorPayload>): this {
    return this._extends({
      checkers: [
        (value: Array<any>, { ctx }) => {
          if (value.length <= length) return value;
          return ctx.throwError(TooBigError, {
            expectedSize: length,
            receivedSize: value.length,
            message: error,
            inputData: value,
          });
        },
      ],
    });
  }

  nonempty(error?: ErrorConstructorMessage<SizeErrorPayload>): this {
    return this._extends({
      checkers: [
        (value: Array<any>, { ctx }) => {
          if (value.length > 0) return value;
          return ctx.throwError(TooSmallError, {
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
