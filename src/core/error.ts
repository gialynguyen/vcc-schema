import { enumFromArray } from "../utils/enumFromArray";
import { Types } from "../datatype/type";

export const ErrorCode = enumFromArray([
  "invalid_type",
  "custom_error",
  "max_size",
  "no_error",
  "incorrect_size",
  "too_small",
  "too_big",
  "no_empty",
  "invalid_field",
]);

export type ErrorCodeType = keyof typeof ErrorCode;

export interface BaseError {
  code: ErrorCodeType | string;
  message: string;
  fieldPath?: string;
}

export type BaseErrorPayload = {
  readonly code: ErrorCodeType | string;
  readonly fieldPath?: string;
};

export type BaseErrorPayloadByType = BaseErrorPayload & {
  readonly code: ErrorCodeType | string;
  readonly rightType?: Types;
  readonly receiveType?: string;
  readonly message?: string;
};

export type ErrorBuilderPayload<Type extends Types | string> = {
  data?: Type;
  fieldPath?: string;
  receiveType?: string;
};

export const makeErrorSubject = (payload: BaseErrorPayloadByType) => {
  let message = payload.message ?? "";
  if (!payload.message) {
    if ([ErrorCode.invalid_type].includes(payload.code)) {
      message = `Expected ${payload.rightType}, received ${payload.receiveType}`;
    }
  }

  return {
    code: payload.code,
    message,
    fieldPath: payload.fieldPath,
  };
};

export class ErrorSubject extends Error {
  errors: BaseError[];

  constructor(errors?: BaseError[]) {
    super();
    // restore prototype chain
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      (this as any).__proto__ = actualProto;
    }
    this.errors = errors || [];
  }

  static create = (errors?: BaseError[]) => {
    const error = new ErrorSubject(errors);
    return error;
  };

  get message() {
    const errorMessage: string[] = [
      `${this.errors.length} issue(s) has found`,
      "",
    ];
    for (const err of this.errors) {
      const pathString = err.fieldPath;
      errorMessage.push(
        `  Error ${this.errors.indexOf(err) + 1}: ${err.code} ${
          pathString && `at: ${pathString}`
        }`
      );
      errorMessage.push(`  ` + err.message);
      errorMessage.push("");
    }

    return errorMessage.join("\n");
  }

  get isEmpty(): boolean {
    return this.errors.length === 0;
  }

  addError = (sub: BaseError) => {
    this.errors = [...this.errors, sub];
  };

  addErrors = (sub: BaseError[] = []) => {
    this.errors = [...this.errors, ...sub];
  };
}
