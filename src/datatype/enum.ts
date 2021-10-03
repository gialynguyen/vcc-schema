import { isNumber, isString } from "vcc-utils";
import { Writable } from "../@types";
import {
  ErrorConstructorMessage,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from "../error";
import { CoreType, Types } from "./base";

export type EnumElement = string | number;

export class EnumType<
  EnumItemType extends EnumElement,
  Items extends [EnumItemType, ...EnumItemType[]]
> extends CoreType<Items[number]> {
  static create = <
    EnumItemType extends EnumElement,
    Items extends Readonly<[EnumItemType, ...EnumItemType[]]>
  >(
    enumValue: Items,
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ): EnumType<EnumItemType, Writable<Items>> => {
    return new EnumType<EnumItemType, Writable<Items>>({
      type: Types.enum,
      defaultCheckers: [
        (value: any, { ctx: { paths } }): Items[number] | InvalidTypeError => {
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

  get(v: Items[number]) {
    return v;
  }
}

export const enumType = EnumType.create;
