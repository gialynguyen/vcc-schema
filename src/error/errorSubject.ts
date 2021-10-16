import { IObject } from '../@types';
import { Subject } from '../core/subject';
import { IError } from './type';

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

export type ErrorExtendSubjectClass = {
  new (...args: any[]): ErrorSubject;
};

export type ErrorType<Type> = Type extends IObject
  ? { [key in keyof Type]: ErrorType<Type[key]> }
  : Type extends any[]
  ? ErrorType<Type[number]>
  : ErrorSubject;
