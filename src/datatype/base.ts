import { ParserContext, runnerParser } from "../parser/parser";
import { Checker } from "../parser/checker";

import {
  array,
  ArrayType,
  nullable,
  NullType,
  undefined,
  UndefinedType,
  oneOf,
  OneOfType,
} from "./";
import { DeepPartial, NoneDeepPartial } from "../@types";

export enum Types {
  string = "string",
  number = "number",
  date = "date",
  boolean = "boolean",
  mixed = "mixed",
  array = "array",
  undefined = "undefined",
  null = "null",
  void = "void",
  any = "any",
  unknown = "unknown",
  enum = "enum",
  oneOf = "oneOf",
  custom = "custom",
}

export type ValueType<Type extends CoreType<unknown>> = ReturnType<
  Type["parser"]
>;

export interface CoreTypeConstructorParams {
  defaultCheckers: Checker[];
  type: Types;
  ref?: boolean;
}

export abstract class CoreType<Type> {
  protected _type: Types;

  protected _checkers: Checker[];

  parser: (x: any, ctx?: ParserContext) => Type;

  tryParser: (
    x: any,
    ctx?: Omit<ParserContext, "tryParser">
  ) => NoneDeepPartial<Type>;

  tryDeepParser: (
    x: any,
    ctx?: Omit<ParserContext, "deepTryParser" | "tryParser">
  ) => DeepPartial<Type>;

  optional: () => OneOfType<[this, UndefinedType]>;

  nullable: () => OneOfType<[this, NullType]>;

  array: () => ArrayType<Type>;

  constructor(params: CoreTypeConstructorParams) {
    this._checkers = params.defaultCheckers || [];
    this._type = params.type;

    this.parser = runnerParser({ checkers: this._checkers });

    this.tryParser = (raw: any, ctx?: Omit<ParserContext, "tryParser">) =>
      this.parser(raw, {
        paths: [],
        ...ctx,
        tryParser: true,
      }) as NoneDeepPartial<Type>;

    this.tryDeepParser = (raw: any, ctx?: Omit<ParserContext, "tryParser">) =>
      this.parser(raw, {
        paths: [],
        ...ctx,
        tryParser: true,
        deepTryParser: true,
      }) as DeepPartial<Type>;

    this.optional = () => {
      return oneOf([this, undefined()]);
    };

    this.nullable = (): OneOfType<[this, NullType]> => {
      return oneOf([this, nullable()]);
    };

    this.array = () => array(this);
  }

  _extends(payload: { checkers: Checker[] }): this {
    return new (this as any).constructor({
      defaultCheckers: [...this._checkers, ...payload.checkers],
      type: this._type,
    });
  }

  check(checker: Checker) {
    return new (this as any).constructor({
      defaultCheckers: [...this._checkers, checker],
      type: this._type,
    });
  }

  get type() {
    return this._type;
  }
}
