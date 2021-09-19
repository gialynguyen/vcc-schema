import { any } from "./any";
import { array } from "./array";
import { boolean } from "./boolean";
import { date } from "./date";
import { enumType } from "./enum";
import { func } from "./func";
import { mixed } from "./mixed";
import { nullable } from "./null";
import { number } from "./number";
import { oneOf } from "./oneOf";
import { record } from "./record";
import { string } from "./string";
import { tuples } from "./tuples";
import { undefinedType } from "./undefined";
import { unknown } from "./unknown";

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

export * from "./any";
export * from "./array";
export * from "./base";
export * from "./boolean";
export * from "./constant";
export * from "./date";
export * from "./enum";
export * from "./func";
export * from "./mixed";
export * from "./null";
export * from "./number";
export * from "./oneOf";
export * from "./record";
export * from "./string";
export * from "./tuples";
export * from "./undefined";
export * from "./unknown";

