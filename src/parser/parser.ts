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
    let errors: ErrorSubject[] = [];
    let shouldThrowError = false;
    for (let index = 0; index < checkers.length; index++) {
      const checker = checkers[index];

      const passed = checker(raw, {
        ctx: { paths, tryParser, deepTryParser },
      });

      if (passed !== true) {
        if (passed instanceof ErrorSubject) {
          if (passed.error.prerequisite) shouldThrowError = true;
          errors.push(passed);
        } else if (passed instanceof ErrorSet) {
          if (passed.hasPrerequisiteError) shouldThrowError = true;
          errors = errors.concat(passed.errors);
        }

        if (errors.length && tryParser) {
          returnValue = undefined;
          break;
        }

        if (shouldThrowError) {
          const errorSubject = new ErrorSet(errors);
          if (nestedParser) return errorSubject;
          throw errorSubject;
        }
      }
    }

    if (!errors.length) {
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
          errors.push(error);
        }
      }
    }

    if (errors.length && !tryParser) {
      const errorSubject = new ErrorSet(errors);
      if (nestedParser) return errorSubject;
      throw errorSubject;
    }

    return returnValue;
  };
};
