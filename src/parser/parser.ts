import { isArray, isDate, isNull } from "vcc-utils";

import { ErrorSet, ErrorSubject } from "../error";
import { ErrorCode } from "../error/type";
import { Checker, LazyType } from "./checker";

export interface ParserPayload {
  checkers: Checker[];
  lazyCheckers: LazyType<any>[];
}

export interface ParserContext {
  paths: (string | number)[];
  tryParser?: boolean;
  deepTryParser?: boolean;
  nestedParser?: boolean;
}

export const runnerParser = ({ checkers, lazyCheckers }: ParserPayload) => {
  return (
    raw: any,
    { paths, tryParser, deepTryParser, nestedParser }: ParserContext = {
      paths: [],
      tryParser: false,
      deepTryParser: false,
      nestedParser: false,
    }
  ) => {
    let returnValue = raw;
    const errorSubject = new ErrorSet();
    for (let index = 0; index < checkers.length; index++) {
      const checker = checkers[index];

      let receiveType: string = typeof raw;
      if (receiveType === "object") {
        if (isArray(raw)) receiveType = "array";
        if (isDate(raw)) receiveType = "date";
        if (isNull(raw)) receiveType = "null";

        if (receiveType === "object") receiveType = "mixed";
      }

      try {
        const passed = checker(raw, {
          ctx: { paths, tryParser, deepTryParser },
        });

        if (passed instanceof ErrorSubject) {
          errorSubject.addError(passed);
        }

        if (passed instanceof ErrorSet) {
          errorSubject.addErrors(passed.errors);
        }
      } catch (error) {}

      if (!errorSubject.isEmpty && tryParser) {
        returnValue = undefined;
        break;
      }

      if (errorSubject.hasPrerequisiteError) {
        if (nestedParser) return errorSubject;
        throw errorSubject;
      }
    }

    if (errorSubject.isEmpty) {
      for (let index = 0; index < lazyCheckers.length; index++) {
        const { checker, message, defaultPaths, errorType } =
          lazyCheckers[index];
        const passed = checker(raw);
        if (!passed) {
          const error = new ErrorSubject({
            code: errorType || ErrorCode.custom_error,
            message,
            paths: defaultPaths || [],
          });
          errorSubject.addError(error);
        }
      }
    }

    if (!errorSubject.isEmpty && !tryParser) {
      if (nestedParser) return errorSubject;
      throw errorSubject;
    }

    return returnValue;
  };
};
