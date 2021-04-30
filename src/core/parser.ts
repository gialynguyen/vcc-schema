import { isArray, isDate, isNull, isObject } from "hardcore-react-utils";
import { ICheckSubject } from "./type";

import {
  BaseError,
  ErrorBuilderPayload,
  ErrorCode,
  ErrorSubject,
  makeErrorSubject,
} from "./error";
import { Types, BaseType } from "./type";
import { IObject } from "../@types";

const addErrorBase = (
  subject: ErrorSubject,
  errorBase:
    | BaseError
    | ((params: ErrorBuilderPayload<any>) => BaseError)
    | undefined,
  fieldPath: string,
  data: any,
  receiveType: string
) => {
  if (typeof errorBase === "function") {
    subject.addError({
      ...errorBase({
        data,
        fieldPath: fieldPath,
        receiveType,
      }),
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

export const runtimeParser = (params: { checkers: ICheckSubject[] }) => (
  raw: any,
  context: ParseContext = {
    options: { strict: true },
  }
) => {
  const { checkers } = params;
  let returnValue = raw;
  const errorSubject = new ErrorSubject();

  for (let index = 0; index < checkers.length; index++) {
    const {
      checker,
      error,
      childrenPropertyChecker,
      type,
      transform = [],
    } = checkers[index];

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
          addErrorBase(errorSubject, error, defaultFieldPath, raw, receiveType);
        }
      } catch (error) {
        (error as ErrorSubject).errors.forEach((errorItem) => {
          addErrorBase(
            errorSubject,
            errorItem,
            defaultFieldPath,
            raw,
            receiveType
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

    if (
      type === Types.mixed &&
      childrenPropertyChecker &&
      isObject(childrenPropertyChecker)
    ) {
      if (context.options?.strict) {
        returnValue = {};
        const rawObjectKeys = Object.keys(raw);
        const propertyCheckerKeys = Object.keys(childrenPropertyChecker);
        const diffKeys = rawObjectKeys.filter(
          (key) => !propertyCheckerKeys.includes(key)
        );
        if (diffKeys.length > 0) {
          const invalidFieldErrors = diffKeys.map((key) =>
            makeErrorSubject({
              code: ErrorCode.invalid_field,
              message: `${key} is an invalid field`,
              fieldPath: `${
                defaultFieldPath ? `${defaultFieldPath}.` : ""
              }${key}`,
            })
          );

          errorSubject.addErrors(invalidFieldErrors);
        }
      }

      for (const key in childrenPropertyChecker) {
        if (
          Object.prototype.hasOwnProperty.call(childrenPropertyChecker, key)
        ) {
          const propertySubjectChecker = (childrenPropertyChecker as IObject<
            BaseType<unknown, any>
          >)[key];

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

    if (
      type === Types.array &&
      childrenPropertyChecker &&
      isArray(childrenPropertyChecker)
    ) {
      returnValue = raw;
      const itemTypeObject = childrenPropertyChecker[0];
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

export const runtimeParserSilent = (
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
