import { Subject } from "../core/subject";
import { joinFieldPath } from "../utils";
import { ErrorCodeType } from "./type";

export interface IError {
  code: ErrorCodeType;
  message: string;
  paths: string[];
}

export class ErrorSubject extends Subject<IError> {
  public error: IError;

  constructor(error: IError) {
    super({ initialState: error });
    this.error = this.proxyState;
  }
}

export class ErrorSet extends Error {
  errors: ErrorSubject[];

  constructor(errors?: ErrorSubject[]) {
    super();

    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      (this as any).__proto__ = actualProto;
    }
    this.errors = errors || [];
  }

  get message() {
    const errorMessage: string[] = [
      `${this.errors.length} issue(s) has found`,
      "",
    ];
    for (const err of this.errors) {
      const pathString = joinFieldPath(err.error.paths);
      errorMessage.push(
        `   Error ${this.errors.indexOf(err) + 1}: ${err.error.code} ${
          pathString && `at: ${pathString}`
        }`
      );
      errorMessage.push(`   ${err.error.message}`);
      errorMessage.push("");
    }

    return errorMessage.join("\n");
  }

  get isEmpty(): boolean {
    return this.errors.length === 0;
  }

  addError = (sub: ErrorSubject) => {
    this.errors = [...this.errors, sub];
  };

  addErrors = (sub: ErrorSubject[] = []) => {
    this.errors = [...this.errors, ...sub];
  };
}