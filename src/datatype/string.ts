import { isString } from "hardcore-react-utils";
import { IObject } from "../@types";
import {
  BaseType,
  ICheckSubject,
  ICheckTypeError,
  SchemaDefine,
  Types,
} from "./type";

import { ErrorCode, makeErrorSubject } from "../core";

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

  max = (
    maxLength: number,
    options?: {
      error?: ICheckTypeError<Types.string>;
      errorMessage?: string;
    }
  ) => {
    let errorBuilder: ICheckTypeError<Types.string>;
    if (options?.error) {
      errorBuilder = options.error;
    } else {
      errorBuilder = ({ data, fieldPath }) =>
        makeErrorSubject({
          code: ErrorCode.max_size,
          message: `Length must be less than ${maxLength}, but received ${data?.length}`,
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
          errorMessage: options?.errorMessage,
        },
      ],
    });
  };

  min = (
    minLength: number,
    options?: {
      error?: ICheckTypeError<Types.string>;
      errorMessage?: string;
    }
  ) => {
    let errorBuilder: ICheckTypeError<Types.string>;
    if (options?.error) {
      errorBuilder = options?.error;
    } else {
      errorBuilder = ({ data, fieldPath }) =>
        makeErrorSubject({
          code: ErrorCode.too_small,
          message: `Length must be greater than ${minLength}, but received ${data?.length}`,
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
          errorMessage: options?.errorMessage,
        },
      ],
    });
  };

  length = (
    length: number,
    options?: {
      error?: ICheckTypeError<Types.string>;
      errorMessage?: string;
    }
  ) => {
    let errorBuilder: ICheckTypeError<Types.string>;
    if (options?.error) {
      errorBuilder = options?.error;
    } else {
      errorBuilder = ({ data, fieldPath }) =>
        makeErrorSubject({
          code: ErrorCode.incorrect_size,
          message: `Length must be equal to ${length}, but received ${data?.length}`,
          fieldPath,
        });
    }

    const _options = Object.assign({ errorOptions: errorBuilder }, options);

    return this.max(length, _options).min(length, _options);
  };
}

export const string = StringType.create;
