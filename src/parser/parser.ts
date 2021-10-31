import { CoreType, DateType, Types } from '../datatype';
import { ErrorCode, ErrorSet, ErrorSubject } from '../error';
import { clone } from '../utils';
import { Checker, LazyType } from './checker';
import { BeforeTransform } from './transform';

export interface ParserPayload<Type> {
  checkers: Checker<Type>[];
  beforeTransform: BeforeTransform[];
  lazyCheckers: LazyType<Type>[];
  schemaType: CoreType<Type>;
}

export interface ParserContext {
  paths?: (string | number)[];
  tryParser?: boolean;
  deepTryParser?: boolean;
  nestedParser?: boolean;
  throwOnFirstError?: boolean;
}

const beforeTransformRunner = (
  inputData: unknown,
  ...transformers: Array<BeforeTransform>
) => {
  let transformedData = clone(inputData);
  for (let index = 0; index < transformers.length; index++) {
    transformedData = transformers[index](clone(transformedData));
  }

  return transformedData;
};

export const runnerParser = <Type = any>({
  beforeTransform,
  checkers,
  lazyCheckers,
  schemaType,
}: ParserPayload<Type>) => {
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
    let returnValue = clone(raw);
    let errors: ErrorSubject[] = [];
    let shouldThrowError = false;

    const { defaultValue, type, throwError } = schemaType;

    returnValue = beforeTransformRunner(returnValue, ...beforeTransform);

    for (let index = 0; index < checkers.length; index++) {
      const checker = checkers[index];
      let slotErrors: ErrorSubject[] = [];
      const passed = checker(returnValue, {
        ctx: {
          paths: paths || [],
          tryParser,
          deepTryParser,
          throwOnFirstError,
          throwError,
        },
      });

      if (passed instanceof ErrorSubject) {
        if (passed.error.prerequisite) shouldThrowError = true;
        slotErrors.push(passed);
      } else if (passed instanceof ErrorSet) {
        if (passed.hasPrerequisiteError) shouldThrowError = true;
        slotErrors = slotErrors.concat(passed.errors);
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
        slotErrors = slotErrors.concat(passed);
      }

      const slotHasError = slotErrors.length > 0;

      if (defaultValue && slotHasError) {
        if (typeof defaultValue === 'function' && type !== Types.func) {
          returnValue = (defaultValue as Function)();
        } else {
          returnValue = defaultValue;
        }

        if (shouldThrowError) {
          break;
        }

        continue;
      }

      errors = errors.concat(slotErrors);

      if (errors.length && tryParser) {
        returnValue = undefined;
        break;
      }

      if (throwOnFirstError && errors.length) shouldThrowError = true;

      if (shouldThrowError) {
        if (nestedParser) return errors;
        const errorSubject = new ErrorSet(errors);
        throw errorSubject;
      }

      if (!slotHasError) {
        if (schemaType instanceof DateType) {
          const { format } = schemaType;
          if (format === 'ISO' || format === 'strictISO')
            returnValue = new Date(returnValue);
        }
      }
    }

    if (!errors.length) {
      for (let index = 0; index < lazyCheckers.length; index++) {
        const { checker, message, defaultPaths, errorType } =
          lazyCheckers[index];
        const passed = checker(returnValue);
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
