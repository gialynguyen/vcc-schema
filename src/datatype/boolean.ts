import { isBoolean } from "hardcore-react-utils";
import { IObject } from "../@types";
import {
  BaseType,
  ICheckSubject,
  SchemaDefine,
  Types,
} from "./type";

import { ErrorCode, makeErrorSubject } from "../core";

export interface BooleanSchemeTypeDefine extends SchemaDefine {
  type: Types.boolean;
}

export const defaultBooleanCheckSubject: ICheckSubject<
  Types.boolean,
  IObject,
  boolean
> = {
  checker: isBoolean,
  error: (builderPayload) =>
    makeErrorSubject({
      fieldPath: builderPayload.fieldPath,
      code: ErrorCode.invalid_type,
      receiveType: builderPayload.receiveType,
      rightType: Types.boolean,
    }),
  type: Types.boolean,
};

export class BooleanType extends BaseType<boolean, BooleanSchemeTypeDefine> {
  static create = () => {
    return new BooleanType({
      type: Types.boolean,
      checkers: [defaultBooleanCheckSubject],
    });
  };
}

export const boolean = BooleanType.create;
