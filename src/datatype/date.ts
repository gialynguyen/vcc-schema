import { isDate, isValidDate } from "hardcore-react-utils";
import { IObject } from "../@types";
import { BaseType, ICheckSubject, SchemaDefine, Types } from "./type";

import { ErrorCode, makeErrorSubject } from "../core";

export interface DateSchemeTypeDefineOptions {
  autoParse: boolean;
}

export interface DateSchemeTypeDefine
  extends SchemaDefine<DateSchemeTypeDefineOptions> {
  type: Types.date;
  options?: DateSchemeTypeDefineOptions;
}

export const defaultDateCheckSubject: ICheckSubject<Types.date> = {
  checker: isDate,
  error: (builderPayload) =>
    makeErrorSubject({
      fieldPath: builderPayload.fieldPath,
      code: ErrorCode.invalid_type,
      receiveType: builderPayload.receiveType,
      rightType: Types.date,
    }),
  type: Types.date,
};

export const defaultDateAutoParseCheckSubject: ICheckSubject<
  Types.date,
  IObject,
  Date
> = {
  checker: isValidDate,
  error: (builderPayload) =>
    makeErrorSubject({
      fieldPath: builderPayload.fieldPath,
      code: ErrorCode.invalid_type,
      receiveType: builderPayload.receiveType,
      rightType: Types.date,
    }),
  type: Types.date,
  transform: [(value) => new Date(value)],
};

export class DateType extends BaseType<Date, DateSchemeTypeDefine> {
  static create = (
    options: DateSchemeTypeDefineOptions = { autoParse: true }
  ) => {
    const defaultCheckSubject = options.autoParse
      ? defaultDateAutoParseCheckSubject
      : defaultDateCheckSubject;

    return new DateType({
      type: Types.date,
      checkers: [defaultCheckSubject],
      options,
    });
  };
}

export const date = DateType.create;
