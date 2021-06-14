import { isArray } from "vcc-utils";
import { CoreType, Types } from "./base";

import {
  ErrorConstructorMessage,
  ErrorSet,
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
        (value: any, { ctx: { paths } }) => {
          const isValidArray = isArray(value);
          if (isValidArray) return true;

          return new InvalidTypeError({
            expectedType: Types.array,
            receivedType: typeOf(value),
            message: error,
            paths,
            prerequisite: true,
          });
        },
        (value: any, { ctx: { paths, ...otherCtxState } }) => {
          const returnValue = value;
          const errorSubject = new ErrorSet();

          for (let index = 0; index < value.length; index++) {
            const rawItem = value[index];
            const rawItemOrError = elementType.parser(rawItem, {
              ...otherCtxState,
              tryParser: otherCtxState.deepTryParser
                ? otherCtxState.tryParser
                : false,
              paths: [...paths, index],
              nestedParser: true,
            });
            if (rawItemOrError instanceof ErrorSet) {
              errorSubject.addErrors((rawItemOrError as ErrorSet).errors);
              if (otherCtxState.tryParser) returnValue[index] = undefined;
            } else {
              returnValue[index] = rawItemOrError;
            }
          }

          if (!errorSubject.isEmpty && !otherCtxState.tryParser) {
            return errorSubject;
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
