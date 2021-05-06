import { IObject } from "../@types";
import { BaseType, ICheckSubject, SchemaDefine, Types } from "./type";

import { ErrorCode, makeErrorSubject } from "../core";

export interface UnknownSchemeTypeDefine extends SchemaDefine {
  type: Types.unknown;
}

export const defaultUnknownCheckSubject: ICheckSubject<
  Types.unknown,
  IObject,
  unknown
> = {
  checker: () => true,
  error: (builderPayload) =>
    makeErrorSubject({
      fieldPath: builderPayload.fieldPath,
      code: ErrorCode.invalid_type,
      receiveType: builderPayload.receiveType,
      rightType: Types.unknown,
    }),
  type: Types.unknown,
};

export class UnknownType extends BaseType<unknown, UnknownSchemeTypeDefine> {
  static create = () => {
    return new UnknownType({
      type: Types.unknown,
      checkers: [defaultUnknownCheckSubject],
    });
  };
}

export const unknown = UnknownType.create;
