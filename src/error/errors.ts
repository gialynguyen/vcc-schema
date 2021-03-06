import { isFunction } from "vcc-utils";
import { Primitive } from "../@types";
import { ErrorSubject } from "./errorSubject";
import { ErrorCode } from "./type";

export type ErrorConstructorMessage<ParamByErrorType> =
  | string
  | ((params: ParamByErrorType) => string);

export interface InvalidTypeErrorPayload {
  expectedType: Primitive;
  receivedType: Primitive;
  instance?: typeof InvalidTypeError;
}

export type ErrorConstructorParams<Params> = Params & {
  inputData?: any;
  message?: ErrorConstructorMessage<Params>;
  paths?: (string | number)[];
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

  public expectedType: Primitive;

  public receivedType: Primitive;

  constructor(payload: ErrorConstructorParams<InvalidTypeErrorPayload>) {
    let message = payload.message || InvalidTypeError.defaultMessage;
    if (isFunction(message)) {
      message = (message as Function)({
        instance: InvalidTypeError,
        expectedType: payload.expectedType,
        receivedType: payload.receivedType,
      });
    }

    super({
      code: ErrorCode.invalid_type,
      message: message as string,
      paths: payload.paths || [],
      prerequisite: payload.prerequisite,
      inputData: payload.inputData,
    });

    this.expectedType = payload.expectedType;
    this.receivedType = payload.receivedType;
  }

  static set setDefaultMessage(config: typeof InvalidTypeError.defaultMessage) {
    InvalidTypeError.defaultMessage = config;
  }

  static is(error: any): error is InvalidTypeError {
    return error instanceof InvalidTypeError;
  }
}

export interface InvalidUnionTypeErrorPayload {
  expectedType: string[];
  receivedType: string;
  instance?: typeof InvalidUnionTypeError;
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
        instance: InvalidUnionTypeError,
        expectedType: payload.expectedType,
        receivedType: payload.receivedType,
      });
    }

    super({
      code: ErrorCode.invalid_type,
      message: message as string,
      paths: payload.paths || [],
      prerequisite: payload.prerequisite,
      inputData: payload.inputData,
    });

    this.expectedType = payload.expectedType;
    this.receivedType = payload.receivedType;
  }

  static set setDefaultMessage(
    config: typeof InvalidUnionTypeError.defaultMessage
  ) {
    InvalidUnionTypeError.defaultMessage = config;
  }

  static is(error: any): error is InvalidUnionTypeError {
    return error instanceof InvalidUnionTypeError;
  }
}

export interface SizeErrorPayload {
  expectedSize: number;
  receivedSize: number;
  instance?:
    | typeof TooSmallError
    | typeof TooBigError
    | typeof IncorrectSizeError;
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
        instance: TooSmallError,
        expectedSize: payload.expectedSize,
        receivedSize: payload.receivedSize,
      });
    }

    super({
      code: ErrorCode.too_small,
      message: message as string,
      paths: payload.paths || [],
      prerequisite: payload.prerequisite,
      inputData: payload.inputData,
    });

    this.expectedSize = payload.expectedSize;
    this.receivedSize = payload.receivedSize;
  }

  static set setDefaultMessage(config: typeof TooSmallError.defaultMessage) {
    TooSmallError.defaultMessage = config;
  }

  static is(error: any): error is TooSmallError {
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
        instance: TooBigError,
        expectedSize: payload.expectedSize,
        receivedSize: payload.receivedSize,
      });
    }

    super({
      code: ErrorCode.too_big,
      message: message as string,
      paths: payload.paths || [],
      prerequisite: payload.prerequisite,
      inputData: payload.inputData,
    });

    this.expectedSize = payload.expectedSize;
    this.receivedSize = payload.receivedSize;
  }

  static set setDefaultMessage(config: typeof TooBigError.defaultMessage) {
    TooBigError.defaultMessage = config;
  }

  static is(error: any): error is TooBigError {
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
        instance: IncorrectSizeError,
        expectedSize: payload.expectedSize,
        receivedSize: payload.receivedSize,
      });
    }

    super({
      code: ErrorCode.incorrect_size,
      message: message as string,
      paths: payload.paths || [],
      prerequisite: payload.prerequisite,
      inputData: payload.inputData,
    });

    this.expectedSize = payload.expectedSize;
    this.receivedSize = payload.receivedSize;
  }

  static set setDefaultMessage(
    config: typeof IncorrectSizeError.defaultMessage
  ) {
    IncorrectSizeError.defaultMessage = config;
  }

  static is(error: any): error is IncorrectSizeError {
    return error instanceof IncorrectSizeError;
  }
}

export interface NoEqualErrorPayload<Type> {
  expectedValue: Type;
  receivedValue: Type;
  instance?: typeof NoEqualError;
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
        instance: NoEqualError,
        expectedValue: payload.expectedValue,
        receivedValue: payload.receivedValue,
      });
    }

    super({
      code: ErrorCode.not_equal,
      message: message as string,
      paths: payload.paths || [],
      prerequisite: payload.prerequisite,
      inputData: payload.inputData,
    });

    this.expectedValue = payload.expectedValue;
    this.receivedValue = payload.receivedValue;
  }

  static set setDefaultMessage(config: typeof NoEqualError.defaultMessage) {
    NoEqualError.defaultMessage = config;
  }

  static is(error: any): error is NoEqualError<unknown> {
    return error instanceof NoEqualError;
  }
}

export interface InvalidFieldErrorPayload {
  invalidFieldPaths: string;
  instance?: typeof InvalidFieldError;
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
        instance: InvalidFieldError,
        invalidFieldPaths: payload.invalidFieldPaths,
      });
    }

    super({
      code: ErrorCode.not_equal,
      message: message as string,
      paths: payload.paths || [],
      prerequisite: payload.prerequisite,
      inputData: payload.inputData,
    });

    this.invalidFieldPaths = payload.invalidFieldPaths;
  }

  static set setDefaultMessage(
    config: typeof InvalidFieldError.defaultMessage
  ) {
    InvalidFieldError.defaultMessage = config;
  }

  static is(error: any): error is InvalidFieldError {
    return error instanceof InvalidFieldError;
  }
}

export interface InvalidStringFormatPayload {
  instance?: typeof InvalidStringFormat;
  receivedString: unknown;
  formatName?: string;
}

export class InvalidStringFormat extends ErrorSubject {
  private static defaultMessage:
    | string
    | ((errorPayload: {
        receivedString: unknown;
        formatName: string;
      }) => string) = ({ receivedString, formatName = "string" }) =>
    `${receivedString} is not a valid ${formatName}`;

  constructor(payload: ErrorConstructorParams<InvalidStringFormatPayload>) {
    let message = payload.message || InvalidStringFormat.defaultMessage;
    if (isFunction(message)) {
      message = (message as Function)({
        instance: InvalidStringFormat,
        receivedString: payload.receivedString,
        formatName: payload.formatName,
      });
    }

    super({
      code: ErrorCode.invalid_string_format,
      message: message as string,
      paths: payload.paths || [],
      prerequisite: payload.prerequisite,
      inputData: payload.inputData,
    });
  }

  static set setDefaultMessage(
    config: typeof InvalidStringFormat.defaultMessage
  ) {
    InvalidStringFormat.defaultMessage = config;
  }

  static is(error: any): error is InvalidStringFormat {
    return error instanceof InvalidStringFormat;
  }
}

export const ErrorSubjects = {
  InvalidTypeError,
  InvalidUnionTypeError,
  TooSmallError,
  TooBigError,
  IncorrectSizeError,
  NoEqualError,
  InvalidFieldError,
  InvalidStringFormat,
  Error: ErrorSubject,
};
