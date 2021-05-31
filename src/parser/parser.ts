import { isArray, isDate, isNull } from "vcc-utils";

import { ErrorSet, ErrorSubject } from "../error";
import { Checker } from "./checker";

export interface ParserPayload {
  checkers: Checker[];
}

export interface ParserContext {
  paths: string[];
}

export const runnerParser = ({ checkers }: ParserPayload) => {
  return (raw: any, { paths }: ParserContext = { paths: [] }) => {
    let returnValue = raw;
    const errorSubject = new ErrorSet();
    for (let index = 0; index < checkers.length; index++) {
      const checker = checkers[index];

      let receiveType: string = typeof raw;
      if (receiveType === "object") {
        if (isArray(raw)) receiveType = "array";
        if (isDate(raw)) receiveType = "date";
        if (isNull(raw)) receiveType = "null";

        if (receiveType === "object") receiveType = "mixed";
      }

      try {
        const passed = checker(raw, { ctx: { paths } });
        if (passed instanceof ErrorSubject) {
          errorSubject.addError(passed);
        }

        if (passed instanceof ErrorSet) {
          errorSubject.addErrors(passed.errors);
        }
      } catch (error) {}

      if (errorSubject.hasPrerequisiteError) {
        throw errorSubject;
      }
    }

    if (!errorSubject.isEmpty) {
      throw errorSubject;
    }

    return returnValue;
  };
};
