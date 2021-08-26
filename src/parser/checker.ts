import { IObject } from "../@types";
import { ErrorSet, ErrorSubject } from "../error/creator";
import { ErrorCodeType } from "../error/type";

export interface CheckerContext {
  paths: (string | number)[];
  tryParser?: boolean;
  deepTryParser?: boolean;
  throwOnFirstError?: boolean;
}

export interface CheckerOptions {
  ctx: CheckerContext;
}

export type Checker<ExpectedType, Input = any> = (
  value: Input,
  options: CheckerOptions
) => ExpectedType | ErrorSubject | ErrorSubject[];

export type LazyObjectTypeChecker<
  Type extends IObject,
  Key extends keyof Type
> = Omit<LazyType<Type>, "checker"> & {
  checker: (value: Type[Key], parsedValue: Type) => boolean;
};

export type LazyObjectType<Type extends IObject> = Partial<
  {
    [key in keyof Type]: LazyObjectTypeChecker<Type, key>;
  }
>;

export type LazyType<Type> = {
  checker: (value: Type) => boolean;
  message: string;
  defaultPaths?: string[];
  errorType?: ErrorCodeType;
};
