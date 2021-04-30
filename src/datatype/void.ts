import { isFunction } from "hardcore-react-utils";
import { IObject } from "../@types";
import { ICallback } from "../@types";
import {
  BaseType,
  ErrorCode,
  ICheckSubject,
  makeErrorSubject,
  SchemaDefine,
  Types,
} from "../core";

export interface VoidSchemeTypeDefine extends SchemaDefine {
  type: Types.void;
}

export const defaultVoidCheckSubject: ICheckSubject<
  Types.void,
  IObject,
  void
> = {
  checker: isFunction,
  error: (builderPayload) =>
    makeErrorSubject({
      fieldPath: builderPayload.fieldPath,
      code: ErrorCode.invalid_type,
      receiveType: builderPayload.receiveType,
      rightType: Types.void,
    }),
  type: Types.void,
};

export class VoidType<
  RType = void,
  AType extends any[] = [],
  BType extends ICallback<RType, AType> = ICallback<RType, AType>
> extends BaseType<BType, VoidSchemeTypeDefine> {
  static create = <RType = void, AType extends any[] = []>() => {
    return new VoidType<RType, AType, ICallback<RType, AType>>({
      type: Types.void,
      checkers: [defaultVoidCheckSubject],
    });
  };
}

export const func = VoidType.create;
