import { IObject } from "../@types";
import {
  BaseType,
  ErrorCode,
  ICheckSubject,
  makeErrorSubject,
  SchemaDefine,
  Types,
} from "../core";

export interface AnySchemeTypeDefine extends SchemaDefine {
  type: Types.any;
}

export const defaultAnyCheckSubject: ICheckSubject<Types.any, IObject, any> = {
  checker: () => true,
  error: (builderPayload) =>
    makeErrorSubject({
      fieldPath: builderPayload.fieldPath,
      code: ErrorCode.invalid_type,
      receiveType: builderPayload.receiveType,
      rightType: Types.any,
    }),
  type: Types.any,
};

export class AnyType extends BaseType<any, AnySchemeTypeDefine> {
  static create = () => {
    return new AnyType({
      type: Types.any,
      checkers: [defaultAnyCheckSubject],
    });
  };
}

export const any = AnyType.create;
