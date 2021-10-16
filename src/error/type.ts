import { IObject } from "../@types";
import { enumFromArray } from "../utils";

export interface IError {
  code: ErrorCodeType;
  inputData?: any;
  message: string;
  paths: (string | number)[];
  prerequisite?: boolean;
}


export const ErrorCode = enumFromArray([
  "invalid_type",
  "too_small",
  "too_big",
  "incorrect_size",
  "not_equal",
  "no_empty",
  "invalid_field",
  "invalid_string_format",
  "custom_error",
]);

export type ErrorCodeType = keyof typeof ErrorCode | string;
