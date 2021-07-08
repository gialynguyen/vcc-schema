import { isDate } from "vcc-utils";

import { CoreType, CoreTypeConstructorParams, Types } from "./base";

import {
  ErrorConstructorMessage,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from "../error";
import { typeOf } from "../utils/type";

// from http://goo.gl/0ejHHW
const iso8601 =
  /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
// same as above, except with a strict 'T' separator between date and time
const iso8601Strict =
  /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;

type DateFormatType = "date" | "ISO" | "strictISO";

export class DateType extends CoreType<Date> {
  public format: DateFormatType;

  constructor(
    props: CoreTypeConstructorParams<Date> & { format: DateFormatType }
  ) {
    const { format, ...superProps } = props;

    super(props);
    this.format = format;
  }

  static create = (
    format: DateFormatType = "date",
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ) => {
    return new DateType({
      type: Types.date,
      format,
      defaultCheckers: [
        (value: any, { ctx: { paths } }) => {
          let valid = false;
          if (format === "ISO") {
            valid = iso8601.test(value);
          } else if (format === "strictISO") {
            valid = iso8601Strict.test(value);
          } else {
            valid = isDate(value);
          }

          if (valid) return true;

          return new InvalidTypeError({
            expectedType: Types.date,
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

export const date = DateType.create;
