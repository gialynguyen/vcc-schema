import { IObject } from "../@types";
import {
  BaseType,
  ErrorCode,
  ICheckSubject,
  makeErrorSubject,
  SchemaDefine,
  Types,
} from "../core";

export interface UndefinedSchemeTypeDefine extends SchemaDefine {
  type: Types.undefined;
}

export const defaultUndefinedCheckSubject: ICheckSubject<
  Types.undefined,
  IObject,
  undefined
> = {
  checker: (value: any) => typeof value === "undefined",
  error: (builderPayload) =>
    makeErrorSubject({
      fieldPath: builderPayload.fieldPath,
      code: ErrorCode.invalid_type,
      receiveType: builderPayload.receiveType,
      rightType: Types.undefined,
    }),
  type: Types.undefined,
};

export class UndefinedType extends BaseType<
  undefined,
  UndefinedSchemeTypeDefine
> {
  static create = () => {
    return new UndefinedType({
      type: Types.undefined,
      checkers: [defaultUndefinedCheckSubject],
    });
  };
}

export const undefined = UndefinedType.create;
