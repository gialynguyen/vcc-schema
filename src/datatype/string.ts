import { isString } from "hardcore-react-utils";
import { IObject } from "../@types";
import {
  BaseType,
  ErrorCode,
  ICheckSubject,
  ICheckTypeError,
  makeErrorSubject,
  SchemaDefine,
  Types,
} from "../core";

export interface StringSchemeTypeDefine extends SchemaDefine {
  type: Types.string;
}

export const defaultStringCheckSubject: ICheckSubject<
  Types.string,
  IObject,
  string
> = {
  checker: isString,
  error: (builderPayload) =>
    makeErrorSubject({
      fieldPath: builderPayload.fieldPath,
      code: ErrorCode.invalid_type,
      receiveType: builderPayload.receiveType,
      rightType: Types.string,
    }),
  type: Types.string,
};

export class StringType extends BaseType<string, StringSchemeTypeDefine> {
  static create = () => {
    return new StringType({
      type: Types.string,
      checkers: [defaultStringCheckSubject],
    });
  };

  max = (maxLength: number, errorOptions?: ICheckTypeError<Types.string>) => {
    let errorBuilder: ICheckTypeError<Types.string>;
    if (errorOptions) {
      errorBuilder = errorOptions;
    } else {
      errorBuilder = ({ data, fieldPath }) =>
        makeErrorSubject({
          code: ErrorCode.max_size,
          message: `Length must be less than ${maxLength}, but received ${data.length}`,
          fieldPath,
        });
    }

    return this._extends({
      checkers: [
        {
          checker: (data: string) => data.length <= maxLength,
          error: errorBuilder,
          type: Types.string,
          desc: `less than ${maxLength}`,
        },
      ],
    });
  };

  min = (minLength: number, errorOptions?: ICheckTypeError<Types.string>) => {
    let errorBuilder: ICheckTypeError<Types.string>;
    if (errorOptions) {
      errorBuilder = errorOptions;
    } else {
      errorBuilder = ({ data, fieldPath }) =>
        makeErrorSubject({
          code: ErrorCode.too_small,
          message: `Length must be greater than ${minLength}, but received ${data.length}`,
          fieldPath,
        });
    }

    return this._extends({
      checkers: [
        {
          checker: (data) => data.length >= minLength,
          error: errorBuilder,
          type: Types.string,
          desc: `greater than ${minLength}`,
        },
      ],
    });
  };

  length = (length: number, errorOptions?: ICheckTypeError<Types.string>) => {
    let errorBuilder: ICheckTypeError<Types.string>;
    if (errorOptions) {
      errorBuilder = errorOptions;
    } else {
      errorBuilder = ({ data, fieldPath }) =>
        makeErrorSubject({
          code: ErrorCode.incorrect_size,
          message: `Length must be equal to ${length}, but received ${data.length}`,
          fieldPath,
        });
    }

    return this.max(length, errorBuilder).min(length, errorBuilder);
  };
}

export const string = StringType.create;
