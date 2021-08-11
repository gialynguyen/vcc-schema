import { string } from "./string";
import { number } from "./number";
import { mixed } from "./mixed";
import { oneOf } from "./oneOf";
import { undefinedType } from "./undefined";
import { nullable } from "./null";
import { func } from "./func";
import { boolean } from "./boolean";
import { any } from "./any";
import { unknown } from "./unknown";
import { date } from "./date";
import { array } from "./array";
import { tuples } from "./tuples";
import { record } from "./record";
import { enumType } from "./enum";

export const VCS = {
  string,
  number,
  mixed,
  oneOf,
  undefinedType,
  nullable,
  func,
  boolean,
  any,
  unknown,
  date,
  array,
  tuples,
  record,
  enumType,
};

export * from "./string";
export * from "./number";
export * from "./mixed";
export * from "./oneOf";
export * from "./undefined";
export * from "./null";
export * from "./func";
export * from "./boolean";
export * from "./any";
export * from "./unknown";
export * from "./date";
export * from "./array";
export * from "./base";
export * from "./constant";
export * from "./tuples";
export * from "./record";
export * from "./enum";
