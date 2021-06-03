import { isDate } from "vcc-utils";

import { CoreType, Types } from "./base";

import {
  ErrorConstructorMessage,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from "../error";
import { typeOf } from "../utils/type";

export class DateType extends CoreType<Date> {
  static create = (
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ) => {
    return new DateType({
      type: Types.date,
      defaultCheckers: [
        (value: any, { ctx: { paths } }) => {
          const valid = isDate(value);
          if (valid) return true;

          return new InvalidTypeError({
            expectedType: Types.date,
            receivedType: typeOf(value),
            message: error,
            paths,
            prerequisite: true,
          });
        },
      ],
    });
  };
}

export const date = DateType.create;
