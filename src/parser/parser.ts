import { ErrorSet, ErrorSubject } from "../error";
import { ErrorCode } from "../error/type";
import { Checker, LazyType } from "./checker";

export interface ParserPayload {
  checkers: Checker[];
  lazyCheckers: LazyType<any>[];
}

export interface ParserContext {
  paths?: (string | number)[];
  tryParser?: boolean;
  deepTryParser?: boolean;
  nestedParser?: boolean;
  throwOnFirstError?: boolean;
}

export const runnerParser = ({ checkers, lazyCheckers }: ParserPayload) => {
  return (
    raw: any,
    {
      paths,
      tryParser,
      deepTryParser,
      nestedParser,
      throwOnFirstError,
    }: ParserContext = {
      paths: [],
      tryParser: false,
      deepTryParser: false,
      nestedParser: false,
      throwOnFirstError: false,
    }
  ) => {
    let returnValue = raw;
    let errors: ErrorSubject[] = [];
    let shouldThrowError = false;
    for (let index = 0; index < checkers.length; index++) {
      const checker = checkers[index];

      const passed = checker(raw, {
        ctx: {
          paths: paths || [],
          tryParser,
          deepTryParser,
          throwOnFirstError,
        },
      });

      if (passed !== true) {
        if (passed instanceof ErrorSubject) {
          if (passed.error.prerequisite) shouldThrowError = true;
          errors.push(passed);
        } else if (passed instanceof ErrorSet) {
          if (passed.hasPrerequisiteError) shouldThrowError = true;
          errors = errors.concat(passed.errors);
        } else if (ErrorSubject.isArrayErrorSubject(passed)) {
          let hasPrerequisiteError = false;
          for (let index = 0; index < passed.length; index++) {
            const error = passed[index];
            if (error.error.prerequisite) {
              hasPrerequisiteError = true;
              break;
            }
          }

          if (hasPrerequisiteError) shouldThrowError = true;
          errors = errors.concat(passed);
        }

        if (errors.length && tryParser) {
          returnValue = undefined;
          break;
        }

        if (throwOnFirstError) shouldThrowError = true;

        if (shouldThrowError) {
          if (nestedParser) return errors;
          const errorSubject = new ErrorSet(errors);
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
          if (throwOnFirstError) break;
        }
      }
    }

    if (errors.length && !tryParser) {
      if (nestedParser) return errors;
      const errorSubject = new ErrorSet(errors);
      throw errorSubject;
    }

    return returnValue;
  };
};
