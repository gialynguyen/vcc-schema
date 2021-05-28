import { ErrorSet, ErrorSubject } from "../error/creator";

export interface CheckerContext {
  paths: string[];
}

export interface CheckerOptions {
  ctx: CheckerContext;
}

export type Checker<
  ErrorParser extends ErrorSubject = ErrorSubject,
  Input = any
> = (value: Input, options: CheckerOptions) => boolean | ErrorParser | ErrorSet;
