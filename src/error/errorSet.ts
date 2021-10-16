import { IObject } from "../@types";
import { joinFieldPath } from "../utils";
import { ErrorSubject } from './errorSubject';
import { IError } from './type';


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

  get message(): string {
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

  addError = (sub: ErrorSubject): ErrorSubject[] => {
    const errors = [...this.errors, sub];
    this.errors = [...errors];

    if (sub.error.prerequisite) {
      this.hasPrerequisiteError = true;
    }

    return errors;
  };

  addErrors = (sub: ErrorSubject[] = []): ErrorSubject[] => {
    sub.forEach((error) => this.addError(error));

    return [...this.errors];
  };

  format = (): IObject<IError> => {
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
