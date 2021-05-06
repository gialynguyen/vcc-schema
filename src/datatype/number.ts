import { isNumber } from "hardcore-react-utils";
import { IObject } from "../@types";
import {
  BaseType,
  ICheckSubject,
  ICheckTypeError,
  SchemaDefine,
  Types,
} from "./type";

import { ErrorCode, makeErrorSubject, ErrorBuilderPayload } from "../core";

export interface NumberSchemeTypeDefine extends SchemaDefine {
  type: Types.number;
}

export const defaultNumberCheckSubject: ICheckSubject<
  Types.number,
  IObject,
  number
> = {
  checker: isNumber,
  error: (builderPayload) =>
    makeErrorSubject({
      fieldPath: builderPayload.fieldPath,
      code: ErrorCode.invalid_type,
      receiveType: builderPayload.receiveType,
      rightType: Types.number,
    }),
  type: Types.number,
};

export class NumberType extends BaseType<number, NumberSchemeTypeDefine> {
  static create = () => {
    return new NumberType({
      type: Types.number,
      checkers: [defaultNumberCheckSubject],
    });
  };

  max = (
    maxValue: number,
    options?: {
      error?: ICheckTypeError<Types.number>;
      errorMessage?: string;
    }
  ) => {
    let errorBuilder: ICheckTypeError<Types.number>;
    if (options?.error) {
      errorBuilder = options?.error;
    } else {
      errorBuilder = ({ data, fieldPath }: ErrorBuilderPayload<Types.number>) =>
        makeErrorSubject({
          code: ErrorCode.too_big,
          message: `Value must be less than ${maxValue}, but received ${data}`,
          fieldPath,
        });
    }

    return this._extends({
      checkers: [
        {
          checker: (data: number) => data <= maxValue,
          error: errorBuilder,
          errorMessage: options?.errorMessage,
          type: Types.number,
          desc: `less than ${maxValue}`,
        },
      ],
    });
  };

  min = (
    minValue: number,
    options?: {
      error?: ICheckTypeError<Types.number>;
      errorMessage?: string;
    }
  ) => {
    let errorBuilder: ICheckTypeError<Types.number>;
    if (options?.error) {
      errorBuilder = options?.error;
    } else {
      errorBuilder = ({ data, fieldPath }) =>
        makeErrorSubject({
          code: ErrorCode.too_small,
          message: `Value must be greater than ${minValue}, but received ${data}`,
          fieldPath,
        });
    }

    return this._extends({
      checkers: [
        {
          checker: (data) => data >= minValue,
          error: errorBuilder,
          errorMessage: options?.errorMessage,
          type: Types.number,
          desc: `greater than ${minValue}`,
        },
      ],
    });
  };
}

export const number = NumberType.create;
