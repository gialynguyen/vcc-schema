import { isFunction } from "vcc-utils";
import { ICallback } from "../@types";
import {
  ErrorConstructorMessage,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from "../error";
import { typeOf } from "../utils/type";
import { CoreType, Types } from "./base";

export class FuncType<
  RType = void,
  AType extends unknown[] = []
> extends CoreType<ICallback<RType, AType>> {
  static create = <RType = void, AType extends unknown[] = []>(
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ): FuncType<RType, AType> => {
    return new FuncType<RType, AType>({
      type: Types.func,
      defaultCheckers: [
        (value: any, { ctx: { paths, throwError } }) => {
          const valid = isFunction(value);
          if (valid) return value;

          return throwError(InvalidTypeError, {
            expectedType: Types.func,
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
}

export const func = FuncType.create;
