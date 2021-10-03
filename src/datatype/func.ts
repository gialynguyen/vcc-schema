import { isFunction } from "vcc-utils";
import { ICallback } from "../@types";
import {
  ErrorConstructorMessage,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from "../error";
import { typeOf } from "../utils/type";
import { CoreType, Types } from "./base";

export class VoidType<
  RType = void,
  AType extends unknown[] = []
> extends CoreType<ICallback<RType, AType>> {
  static create = <RType = void, AType extends unknown[] = []>(
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ): VoidType<RType, AType> => {
    return new VoidType<RType, AType>({
      type: Types.func,
      defaultCheckers: [
        (
          value: any,
          { ctx: { paths } }
        ): ICallback<RType, AType> | InvalidTypeError => {
          const valid = isFunction(value);
          if (valid) return value;

          return new InvalidTypeError({
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

export const func = VoidType.create;
