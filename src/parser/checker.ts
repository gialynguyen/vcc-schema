import { IObject } from "../@types";
import { ErrorCodeType, ErrorExtendSubjectClass, ErrorSubject as ErrorSubjectBase } from "../error";

export interface CheckerContext {
  paths: (string | number)[];
  tryParser?: boolean;
  deepTryParser?: boolean;
  throwOnFirstError?: boolean;
  throwError: <ErrorSubject extends ErrorExtendSubjectClass>(
    errorSubject: ErrorSubject,
    payload: ConstructorParameters<ErrorSubject>[0]
  ) => ErrorSubjectBase;
}

export interface CheckerOptions {
  ctx: CheckerContext;
}

export type Checker<ExpectedType, Input = any> = (
  value: Input,
  options: CheckerOptions
) => true | ExpectedType | ErrorSubjectBase | ErrorSubjectBase[];

export type LazyObjectTypeChecker<
  Type extends IObject,
  Key extends keyof Type
> = Omit<LazyType<Type>, "checker"> & {
  checker: (value: Type[Key], parsedValue: Type) => boolean;
};

export type LazyObjectType<Type extends IObject> = Partial<{
  [key in keyof Type]: LazyObjectTypeChecker<Type, key>;
}>;

export type LazyType<Type> = {
  checker: (value: Type) => boolean;
  message: string;
  defaultPaths?: string[];
  errorType?: ErrorCodeType;
};
