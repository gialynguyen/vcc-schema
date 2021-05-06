import { isArray } from "hardcore-react-utils";
import { IObject } from "../@types";
import { BaseType, ICheckTypeError, SchemaDefine, Types } from "./type";

import { ErrorCode, makeErrorSubject } from "../core";

export interface ArraySchemeTypeDefine extends SchemaDefine {
  type: Types.array;
  itemType: BaseType<any, any>;
}

export class ArrayType<Item> extends BaseType<Item[], ArraySchemeTypeDefine> {
  itemType: BaseType<any, any>;

  constructor(props: ArraySchemeTypeDefine) {
    super(props);
    this.itemType = props.itemType;
  }

  static create = <
    Item,
    SDef extends SchemaDefine<Options>,
    Options extends IObject = IObject
  >(
    itemType: BaseType<Item, SDef>
  ) => {
    return new ArrayType<Item>({
      type: Types.array,
      itemType: itemType,
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
        },
      ],
    });
  };

  noempty(options?: {
    error?: ICheckTypeError<Types.array>;
    errorMessage?: string;
  }) {
    let errorBuilder: ICheckTypeError<Types.array>;
    if (options?.error) {
      errorBuilder = options?.error;
    } else {
      errorBuilder = () =>
        makeErrorSubject({
          code: ErrorCode.no_empty,
          message: `Expected no empty`,
        });
    }
    return this._extends({
      checkers: [
        {
          checker: (value) => value.length > 0,
          type: Types.array,
          error: errorBuilder,
          errorMessage: options?.errorMessage,
        },
      ],
    });
  }
}

export const array = ArrayType.create;
