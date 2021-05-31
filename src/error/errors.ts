import { isFunction } from "vcc-utils";
import { ErrorSubject } from "./creator";
import { ErrorCode } from "./type";

export type ErrorConstructorMessage<ParamByErrorType> =
  | string
  | ((params: ParamByErrorType) => string);

export interface InvalidTypeErrorPayload {
  expectedType: string;
  receivedType: string;
}

export type ErrorConstructorParams<Params> = Params & {
  message?: ErrorConstructorMessage<Params>;
  paths?: string[];
  prerequisite?: boolean;
};

export class InvalidTypeError extends ErrorSubject {
  private static defaultMessage:
    | string
    | ((errorPayload: {
        expectedType: string;
        receivedType: string;
      }) => string) = (payload) =>
    `Expected ${payload.expectedType}, received ${payload.receivedType}`;

  public expectedType: string;

  public receivedType: string;

  constructor(payload: ErrorConstructorParams<InvalidTypeErrorPayload>) {
    let message = payload.message || InvalidTypeError.defaultMessage;
    if (isFunction(message)) {
      message = (message as Function)({
        expectedType: payload.expectedType,
        receivedType: payload.receivedType,
      });
    }

    super({
      code: ErrorCode.invalid_type,
      message: message as string,
      paths: payload.paths || [],
    });

    this.expectedType = payload.expectedType;
    this.receivedType = payload.receivedType;
  }

  static set setDefaultMessage(config: typeof InvalidTypeError.defaultMessage) {
    InvalidTypeError.defaultMessage = config;
  }

  static is(error: any) {
    return error instanceof InvalidTypeError;
  }
}

export interface InvalidUnionTypeErrorPayload {
  expectedType: string[];
  receivedType: string;
}

export class InvalidUnionTypeError extends ErrorSubject {
  private static defaultMessage:
    | string
    | ((errorPayload: {
        expectedType: string[];
        receivedType: string;
      }) => string) = (payload) =>
    `Expected ${InvalidUnionTypeError.joinExpectedType(
      payload.expectedType
    )}, received ${payload.receivedType}`;

  public expectedType: string[];

  public receivedType: string;

  static joinExpectedType(types: string[]) {
    const lastType = types[types.length - 1];
    const headTypes = types.slice(0, -1);

    return `${headTypes.join(", ")} or ${lastType}`;
  }

  constructor(payload: ErrorConstructorParams<InvalidUnionTypeErrorPayload>) {
    let message = payload.message || InvalidUnionTypeError.defaultMessage;
    if (isFunction(message)) {
      message = (message as Function)({
        expectedType: payload.expectedType,
        receivedType: payload.receivedType,
      });
    }

    super({
      code: ErrorCode.invalid_type,
      message: message as string,
      paths: payload.paths || [],
    });

    this.expectedType = payload.expectedType;
    this.receivedType = payload.receivedType;
  }

  static set setDefaultMessage(
    config: typeof InvalidUnionTypeError.defaultMessage
  ) {
    InvalidUnionTypeError.defaultMessage = config;
  }

  static is(error: any) {
    return error instanceof InvalidUnionTypeError;
  }
}

export interface SizeErrorPayload {
  expectedSize: number;
  receivedSize: number;
}

export class TooSmallError extends ErrorSubject {
  private static defaultMessage:
    | string
    | ((errorPayload: {
        expectedSize: number;
        receivedSize: number;
      }) => string) = (payload) =>
    `Length must be greater than ${payload.expectedSize}, but received ${payload.receivedSize}`;

  public expectedSize: number;

  public receivedSize: number;

  constructor(payload: ErrorConstructorParams<SizeErrorPayload>) {
    let message = payload.message || TooSmallError.defaultMessage;

    if (isFunction(message)) {
      message = (message as Function)({
        expectedSize: payload.expectedSize,
        receivedSize: payload.receivedSize,
      });
    }

    super({
      code: ErrorCode.too_small,
      message: message as string,
      paths: payload.paths || [],
    });

    this.expectedSize = payload.expectedSize;
    this.receivedSize = payload.receivedSize;
  }

  static set setDefaultMessage(config: typeof TooSmallError.defaultMessage) {
    TooSmallError.defaultMessage = config;
  }

  static is(error: any) {
    return error instanceof TooSmallError;
  }
}

export class TooBigError extends ErrorSubject {
  private static defaultMessage:
    | string
    | ((errorPayload: {
        expectedSize: number;
        receivedSize: number;
      }) => string) = (payload) =>
    `Length must be less than ${payload.expectedSize}, but received ${payload.receivedSize}`;

  public expectedSize: number;
  public receivedSize: number;

  constructor(payload: ErrorConstructorParams<SizeErrorPayload>) {
    let message = payload.message || TooBigError.defaultMessage;
    if (isFunction(message)) {
      message = (message as Function)({
        expectedSize: payload.expectedSize,
        receivedSize: payload.receivedSize,
      });
    }

    super({
      code: ErrorCode.too_big,
      message: message as string,
      paths: payload.paths || [],
    });

    this.expectedSize = payload.expectedSize;
    this.receivedSize = payload.receivedSize;
  }

  static set setDefaultMessage(config: typeof TooBigError.defaultMessage) {
    TooBigError.defaultMessage = config;
  }

  static is(error: any) {
    return error instanceof TooBigError;
  }
}

export class IncorrectSizeError extends ErrorSubject {
  private static defaultMessage:
    | string
    | ((errorPayload: {
        expectedSize: number;
        receivedSize: number;
      }) => string) = (payload) =>
    `Length must be equal ${payload.expectedSize}, but received ${payload.receivedSize}`;

  public expectedSize: number;
  public receivedSize: number;

  constructor(payload: ErrorConstructorParams<SizeErrorPayload>) {
    let message = payload.message || IncorrectSizeError.defaultMessage;
    if (isFunction(message)) {
      message = (message as Function)({
        expectedSize: payload.expectedSize,
        receivedSize: payload.receivedSize,
      });
    }

    super({
      code: ErrorCode.incorrect_size,
      message: message as string,
      paths: payload.paths || [],
    });

    this.expectedSize = payload.expectedSize;
    this.receivedSize = payload.receivedSize;
  }

  static set setDefaultMessage(
    config: typeof IncorrectSizeError.defaultMessage
  ) {
    IncorrectSizeError.defaultMessage = config;
  }

  static is(error: any) {
    return error instanceof IncorrectSizeError;
  }
}

export interface NoEqualErrorPayload<Type> {
  expectedValue: Type;
  receivedValue: Type;
}

export class NoEqualError<Type> extends ErrorSubject {
  private static defaultMessage:
    | string
    | ((errorPayload: {
        expectedValue: unknown;
        receivedValue: unknown;
      }) => string) = (payload) =>
    `Value must be equal ${payload.expectedValue}, but received ${payload.receivedValue}`;

  public expectedValue: Type;
  public receivedValue: Type;

  constructor(payload: ErrorConstructorParams<NoEqualErrorPayload<Type>>) {
    let message = payload.message || NoEqualError.defaultMessage;
    if (isFunction(message)) {
      message = (message as Function)({
        expectedValue: payload.expectedValue,
        receivedValue: payload.receivedValue,
      });
    }

    super({
      code: ErrorCode.not_equal,
      message: message as string,
      paths: payload.paths || [],
    });

    this.expectedValue = payload.expectedValue;
    this.receivedValue = payload.receivedValue;
  }

  static set setDefaultMessage(config: typeof NoEqualError.defaultMessage) {
    NoEqualError.defaultMessage = config;
  }

  static is(error: any) {
    return error instanceof NoEqualError;
  }
}

export interface InvalidFieldErrorPayload {
  invalidFieldPaths: string;
}

export class InvalidFieldError extends ErrorSubject {
  private static defaultMessage:
    | string
    | ((errorPayload: { invalidFieldPaths: string }) => string) = (payload) =>
    `${payload.invalidFieldPaths} is an invalid field`;

  public invalidFieldPaths: string;

  constructor(payload: ErrorConstructorParams<InvalidFieldErrorPayload>) {
    let message = payload.message || InvalidFieldError.defaultMessage;
    if (isFunction(message)) {
      message = (message as Function)({
        invalidFieldPaths: payload.invalidFieldPaths,
      });
    }

    super({
      code: ErrorCode.not_equal,
      message: message as string,
      paths: payload.paths || [],
    });

    this.invalidFieldPaths = payload.invalidFieldPaths;
  }

  static set setDefaultMessage(
    config: typeof InvalidFieldError.defaultMessage
  ) {
    InvalidFieldError.defaultMessage = config;
  }

  static is(error: any) {
    return error instanceof InvalidFieldError;
  }
}
