import { CoreType, Types } from "./base";

import {
  ErrorConstructorMessage,
  ErrorSet,
  ErrorSubject,
  InvalidTypeError,
  InvalidTypeErrorPayload,
  SizeErrorPayload,
  TooSmallError,
} from "../error";
import { typeOf } from "../utils/type";

export class ArrayType<Item> extends CoreType<Item[]> {
  static create = <Item>(
    elementType: CoreType<Item>,
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ) => {
    return new ArrayType<Item>({
      type: Types.array,
      defaultCheckers: [
        (value: any, { ctx }) => {
          const isValidArray = Array.isArray(value);
          if (isValidArray) return true;

          return new InvalidTypeError({
            expectedType: Types.array,
            receivedType: typeOf(value),
            message: error,
            paths: ctx.paths,
            prerequisite: true,
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

            if (rawItemOrError instanceof ErrorSet) {
              errors = errors.concat(rawItemOrError.errors);

              if (ctx.tryParser) returnValue[index] = undefined;
              if (throwOnFirstError) break;
            } else if (ErrorSubject.isArrayErrorSubject(rawItemOrError)) {
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

  noempty(error?: ErrorConstructorMessage<SizeErrorPayload>) {
    return this._extends({
      checkers: [
        (value: Array<any>) => {
          if (value.length > 0) return true;
          return new TooSmallError({
            expectedSize: 1,
            receivedSize: value.length,
            message: error || "Expected no empty",
          });
        },
      ],
    });
  }
}

export const array = ArrayType.create;
