import { Subject } from "../core/subject";
import { joinFieldPath } from "../utils";
import { ErrorCodeType } from "./type";

export interface IError {
  code: ErrorCodeType;
  inputData?: any;
  message: string;
  paths: (string | number)[];
  prerequisite?: boolean;
}

export class ErrorSubject extends Subject<IError> {
  public error: IError;

  constructor(error: IError) {
    if (!("prerequisite" in error)) {
      error.prerequisite = false;
    }

    super({ initialState: error });
    this.error = this.proxyState;
  }

  static isArrayErrorSubject(subject: unknown): subject is ErrorSubject[] {
    return Array.isArray(subject) && subject[0] instanceof ErrorSubject;
  }
}

export class ErrorSet extends Error {
  errors: ErrorSubject[];

  hasPrerequisiteError: boolean;

  constructor(errors?: ErrorSubject[]) {
    super();

    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      (this as any).__proto__ = actualProto;
    }
    this.errors = errors || [];

    this.hasPrerequisiteError = this.errors.some(
      (error) => error.error.prerequisite
    );
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
    if (sub.error.prerequisite) {
      this.hasPrerequisiteError = true;
    }
  };

  addErrors = (sub: ErrorSubject[] = []) => {
    sub.forEach((error) => this.addError(error));
  };

  format = () => {
    const { errors } = this;
    const objectError = {} as any;
    for (let index = 0; index < errors.length; index++) {
      let pointer = objectError;
      const { error } = errors[index];
      const { paths } = error;

      const pathsSize = paths.length - 1;

      if (paths.length === 0) {
        Reflect.set(pointer, "", error);
      } else {
        paths.forEach((path, index) => {
          const isLastPath = index === pathsSize;
          if (!isLastPath) {
            pointer = pointer[path] = {};
          } else {
            Reflect.set(pointer, path, error);
          }
        });
      }
    }

    return objectError;
  };
}
