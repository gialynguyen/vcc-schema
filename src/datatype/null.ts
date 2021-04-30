import { isNull } from "hardcore-react-utils";
import { IObject } from "../@types";
import {
  BaseType,
  ErrorCode,
  ICheckSubject,
  makeErrorSubject,
  SchemaDefine,
  Types,
} from "../core";

export interface NullSchemeTypeDefine extends SchemaDefine {
  type: Types.null;
}

export const defaultNullCheckSubject: ICheckSubject<
  Types.null,
  IObject,
  null
> = {
  checker: isNull,
  error: (builderPayload) =>
    makeErrorSubject({
      fieldPath: builderPayload.fieldPath,
      code: ErrorCode.invalid_type,
      receiveType: builderPayload.receiveType,
      rightType: Types.null,
    }),
  type: Types.null,
};

export class NullType extends BaseType<null, NullSchemeTypeDefine> {
  static create = () => {
    return new NullType({
      type: Types.null,
      checkers: [defaultNullCheckSubject],
    });
  };
}

export const nullable = NullType.create;
