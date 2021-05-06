import { isArray, isDate, isNull } from "hardcore-react-utils";

import {
  BaseError,
  ErrorBuilderPayload,
  ErrorCode,
  ErrorSubject,
  makeErrorSubject,
} from "./error";

import { ArrayType, MixedType, Types, BaseType } from "../datatype";

const addErrorBase = (
  subject: ErrorSubject,
  errorBase: BaseError | ((params: ErrorBuilderPayload<any>) => BaseError),
  errorMessage?: string,
  fieldPath?: string,
  options?: {
    data?: any;
    receiveType?: string;
    customError?: {
      [key: string]:
        | BaseError
        | ((params: ErrorBuilderPayload<any>) => BaseError);
    };
    customErrorMessage?: {
      [key: string]: string;
    };
  }
) => {
  if (typeof errorBase === "function") {
    const errorPayload = {
      data: options?.data,
      fieldPath: fieldPath,
      receiveType: options?.receiveType,
    };
    let error: BaseError | undefined;
    if (typeof errorBase === "function") {
      error = errorBase(errorPayload);
    } else {
      error = errorBase;
    }

    if (!error) return;

    if (options?.customError && options?.customError[error.code]) {
      const customError = options?.customError[error.code];
      if (typeof customError === "function") {
        error = customError(errorPayload);
      } else {
        error = customError;
      }
    }

    if (
      options?.customErrorMessage &&
      options?.customErrorMessage[error.code]
    ) {
      error.message = options?.customErrorMessage[error.code];
    }

    if (errorMessage) {
      error.message = errorMessage;
    }

    subject.addError({
      ...error,
      fieldPath: fieldPath,
    });
  } else if (errorBase) {
    subject.addError({ ...errorBase, fieldPath: fieldPath });
  }
};

export interface ParseContextOptions {
  strict?: boolean;
}

export interface ParseContext {
  fieldPath?: string;
  options?: ParseContextOptions;
}

export const runtimeParser = (params: BaseType<any, any>) => (
  raw: any,
  context?: ParseContext
) => {
  const { _checkers: checkers, _customError, _customMessage } = params;
  let returnValue = raw;
  const errorSubject = new ErrorSubject();

  for (let index = 0; index < checkers.length; index++) {
    const { checker, error, errorMessage, type, transform = [] } = checkers[
      index
    ];

    let receiveType: string = typeof raw;
    if (receiveType === "object") {
      if (isArray(raw)) receiveType = "array";
      if (isDate(raw)) receiveType = "date";
      if (isNull(raw)) receiveType = "null";
    }
    const defaultFieldPath = context?.fieldPath ?? "";

    if (checker) {
      try {
        const passed = checker(raw);
        if (passed === false) {
          addErrorBase(errorSubject, error, errorMessage, defaultFieldPath, {
            data: raw,
            receiveType,
            customError: _customError,
            customErrorMessage: _customMessage,
          });
        }
      } catch (error) {
        (error as ErrorSubject).errors.forEach((errorItem) => {
          addErrorBase(
            errorSubject,
            errorItem,
            errorMessage,
            defaultFieldPath,
            {
              data: raw,
              receiveType,
              customError: _customError,
              customErrorMessage: _customMessage,
            }
          );
        });
      }

      if (!errorSubject.isEmpty) {
        throw errorSubject;
      }

      for (let index = 0; index < transform.length; index++) {
        const trans = transform[index];
        returnValue = trans(returnValue);
      }
    }

    if (type === Types.mixed) {
      const { childrenPropertyTypes, strict } = params as MixedType<any, any>;
      const strictMode = context?.options?.strict ?? strict ?? true;

      if (strictMode) {
        returnValue = {};
        const rawObjectKeys = Object.keys(raw);
        const propertyCheckerKeys = Object.keys(childrenPropertyTypes);
        const diffKeys = rawObjectKeys.filter(
          (key) => !propertyCheckerKeys.includes(key)
        );
        if (diffKeys.length > 0) {
          diffKeys.forEach((key) =>
            addErrorBase(
              errorSubject,
              () =>
                makeErrorSubject({
                  code: ErrorCode.invalid_field,
                  message: `${key} is an invalid field`,
                  fieldPath: `${
                    defaultFieldPath ? `${defaultFieldPath}.` : ""
                  }${key}`,
                }),
              undefined,
              defaultFieldPath,
              {
                data: raw,
                receiveType,
                customError: _customError,
                customErrorMessage: _customMessage,
              }
            )
          );
        }
      }

      for (const key in childrenPropertyTypes) {
        if (Object.prototype.hasOwnProperty.call(childrenPropertyTypes, key)) {
          const propertySubjectChecker = childrenPropertyTypes[key];

          let propertyValue = raw[key];
          const mergedFieldPath = `${
            defaultFieldPath ? `${defaultFieldPath}.` : ""
          }${key}`;

          try {
            propertyValue = propertySubjectChecker.parser(propertyValue, {
              fieldPath: mergedFieldPath,
              options: context?.options,
            });
          } catch (error) {
            errorSubject.addErrors((error as ErrorSubject).errors);
          }

          returnValue[key] = propertyValue;
        }
      }

      if (!errorSubject.isEmpty) {
        throw errorSubject;
      }
    }

    if (type === Types.array) {
      returnValue = raw;
      const { itemType: itemTypeObject } = params as ArrayType<any>;
      for (let index = 0; index < raw.length; index++) {
        let rawItem = raw[index];

        const mergedFieldPath = `${
          defaultFieldPath ? `${defaultFieldPath}` : ""
        }[${index}]`;

        try {
          rawItem = itemTypeObject.parser(rawItem, {
            fieldPath: mergedFieldPath,
            options: context?.options,
          });
        } catch (error) {
          errorSubject.addErrors((error as ErrorSubject).errors);
        }

        returnValue[index] = rawItem;
      }

      if (!errorSubject.isEmpty) {
        throw errorSubject;
      }
    }
  }

  return returnValue as any;
};

export const runtimeSilentParser = (
  ...params: Parameters<typeof runtimeParser>
) => {
  const parser = (
    value: any,
    context?: { fieldPath?: string; options?: {} }
  ) => {
    let returnValue: any;
    let errorSubject: ErrorSubject | undefined;
    try {
      returnValue = runtimeParser(...params)(value, context);
    } catch (error) {
      errorSubject = error as ErrorSubject;
    }

    if (errorSubject && !errorSubject.isEmpty) {
      return {
        success: false,
        error: errorSubject,
      };
    }

    return {
      success: true,
      data: returnValue,
    };
  };

  return parser;
};
