import { enumFromArray } from "../utils";

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
