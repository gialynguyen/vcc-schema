import { isArray } from "hardcore-react-utils";
import { IObject } from "../@types";
import {
  BaseType,
  ErrorCode,
  makeErrorSubject,
  SchemaDefine,
  Types,
} from "../core";

export interface ArraySchemeTypeDefine extends SchemaDefine {
  type: Types.array;
}

export class ArrayType<Item> extends BaseType<Item[], ArraySchemeTypeDefine> {
  static create = <
    Item,
    SDef extends SchemaDefine<Options>,
    Options extends IObject = IObject
  >(
    itemType: BaseType<Item, SDef>
  ) => {
    return new ArrayType<Item>({
      type: Types.array,
      checkers: [
        {
          checker: isArray,
          error: (builderPayload) =>
            makeErrorSubject({
              fieldPath: builderPayload.fieldPath,
              code: ErrorCode.invalid_type,
              receiveType: builderPayload.receiveType,
              rightType: Types.array,
            }),
          type: Types.array,
          childrenPropertyChecker: [itemType],
        },
      ],
    });
  };

  noempty() {
    return this._extends({
      checkers: [
        {
          checker: (value) => value.length > 0,
          type: Types.array,
          error: () =>
            makeErrorSubject({
              code: ErrorCode.no_empty,
              message: `Expected no empty`,
            }),
        },
      ],
    });
  }
}

export const array = ArrayType.create;
