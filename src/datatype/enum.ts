import { isString, isNumber } from "vcc-utils";

import {
  ErrorConstructorMessage,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from "../error";
import { CoreType, Types } from "./base";

export type EnumElement = string | number;

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export class EnumType<
  EnumItemType extends EnumElement,
  Input extends [EnumItemType, ...EnumItemType[]]
> extends CoreType<Input[number]> {
  static create = <
    EnumItemType extends EnumElement,
    Input extends Readonly<[EnumItemType, ...EnumItemType[]]>
  >(
    enumValue: Input,
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ) => {
    return new EnumType<EnumItemType, Writeable<Input>>({
      type: Types.enum,
      defaultCheckers: [
        (value: any, { ctx: { paths } }) => {
          let valid = false;
          if (isString(value) || isNumber(value)) {
            for (let index = 0; index < enumValue.length; index++) {
              const element = enumValue[index];
              if (element === value) {
                valid = true;
                break;
              }
            }
          }

          if (valid) return value;

          return new InvalidTypeError({
            expectedType: `one of ${enumValue.join(", ")}`,
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

  get(v: Input[number]) {
    return v;
  }
}

export const enumType = EnumType.create;