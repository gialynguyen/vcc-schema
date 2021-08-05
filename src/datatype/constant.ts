import { Primitive } from "../@types";
import {
  ErrorConstructorMessage,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from "../error";
import { CoreType, Types } from "./base";

export class ConstantType<Value extends any> extends CoreType<Value> {
  static create = <Value extends Primitive>(
    constantValue: Value,
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ) => {
    return new ConstantType<Value>({
      type: Types.const,
      defaultCheckers: [
        (value: any, { ctx: { paths } }) => {
          const valid = value === constantValue;
          if (valid) return true;

          return new InvalidTypeError({
            expectedType: constantValue,
            receivedType: value,
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

export const constant = ConstantType.create;