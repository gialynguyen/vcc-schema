import { ParserContext, runnerParser } from "../parser/parser";
import {
  Checker,
  LazyObjectType,
  LazyObjectTypeChecker,
  LazyType,
} from "../parser/checker";

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
import { DeepPartial, ICallback, IObject, NoneDeepPartial } from "../@types";
import { isArray } from "vcc-utils";
import { ErrorSet, ErrorSubject } from "../error";
import { TuplesType } from "./tuples";

export enum Types {
  string = "string",
  number = "number",
  date = "date",
  boolean = "boolean",
  mixed = "mixed",
  array = "array",
  undefined = "undefined",
  null = "null",
  func = "function",
  any = "any",
  unknown = "unknown",
  enum = "enum",
  oneOf = "oneOf",
  custom = "custom",
  const = "const",
  tuples = "tuples",
}

export type ValueType<Type> = Type extends TuplesType<any>
  ? ReturnType<Type["parser"]>
  : Type extends CoreType<infer T>
  ? ReturnType<Type["parser"]>
  : never;

export type ErrorType<Type> = Type extends IObject
  ? { [key in keyof Type]: ErrorType<Type[key]> }
  : Type extends any[]
  ? ErrorType<Type[number]>
  : ErrorSubject;

export type TypeDefaultValue<Type> = Type | ICallback<Type>;

export interface CoreTypeConstructorParams<Type> {
  defaultCheckers: Checker[];
  type: Types;
  defaultValue?: TypeDefaultValue<Type>;
  defaultLazyCheckers?: Type extends IObject
    ? LazyObjectType<any>[]
    : LazyType<any>[];
}

export abstract class CoreType<Type> {
  protected _type: Types;

  protected _checkers: Checker[];

  protected _lazyCheckers: LazyType<any>[];

  protected _defaultValue?: TypeDefaultValue<Type>;

  parser: (raw: any, ctx?: ParserContext) => Type;

  strictParser: (
    raw: any,
    ctx?: Omit<ParserContext, "throwOnFirstError">
  ) => Type;

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

  nullish: () => OneOfType<[this, NullType, UndefinedType]>;

  array: () => ArrayType<this>;

  validate: (
    raw: any
  ) => { success: true; data: Type } | { success: false; error: ErrorSet };

  constructor(params: CoreTypeConstructorParams<Type>) {
    this._checkers = params.defaultCheckers || [];
    this._type = params.type;
    this._lazyCheckers = params.defaultLazyCheckers || ([] as any);

    this.parser = runnerParser({
      checkers: this._checkers,
      lazyCheckers: this._lazyCheckers,
      schemaType: this,
    });

    this.strictParser = (raw, ctx) =>
      this.parser(raw, {
        paths: ctx?.paths || [],
        deepTryParser: ctx?.deepTryParser,
        tryParser: ctx?.tryParser,
        throwOnFirstError: true,
      });

    this.tryParser = (raw, ctx) =>
      this.parser(raw, {
        paths: ctx?.paths || [],
        deepTryParser: ctx?.deepTryParser,
        throwOnFirstError: ctx?.throwOnFirstError,
        tryParser: true,
      }) as NoneDeepPartial<Type>;

    this.tryDeepParser = (raw, ctx) =>
      this.parser(raw, {
        paths: ctx?.paths || [],
        throwOnFirstError: ctx?.throwOnFirstError,
        tryParser: true,
        deepTryParser: true,
      }) as DeepPartial<Type>;

    this.validate = (raw: any) => {
      try {
        const successData = this.parser(raw, {
          paths: [],
        });

        return {
          success: true,
          data: successData,
        };
      } catch (error) {
        return {
          success: false,
          error: error as ErrorSet,
        };
      }
    };

    this.optional = () => {
      return oneOf([this, undefined()]);
    };

    this.nullable = (): OneOfType<[this, NullType]> => {
      return oneOf([this, nullable()]);
    };

    this.array = () => array(this);

    this.nullish = (): OneOfType<[this, NullType, UndefinedType]> => {
      return oneOf([this, nullable(), undefined()]);
    };
  }

  _extends(payload: { checkers?: Checker[]; lazy?: LazyType<Type>[] }): this {
    return new (this as any).constructor({
      defaultCheckers: [...this._checkers, ...(payload.checkers || [])],
      defaultLazyCheckers: [...this._lazyCheckers, ...(payload.lazy || [])],
      type: this._type,
      defaultValue: this._defaultValue,
    });
  }

  check(checker: Checker) {
    return this._extends({
      checkers: [...this._checkers, checker],
    });
  }

  _lazy(lazyOption: LazyType<any>[]) {
    return this._extends({
      lazy: [...lazyOption],
    });
  }

  lazy(
    lazyOption: Type extends Record<any, any>
      ? LazyObjectType<Type>
      : LazyType<Type> | LazyType<Type>[]
  ) {
    if ([Types.mixed].includes(this._type)) {
      const lazyCheckers = [] as LazyType<Type>[];
      for (const key in lazyOption) {
        const {
          checker,
          defaultPaths = [],
          message,
          errorType,
        } = lazyOption[key] as LazyObjectTypeChecker<Type, keyof Type>;
        lazyCheckers.push({
          checker: (parsedValue: Type) => {
            const fieldValue = (parsedValue as any)[key];
            return checker(fieldValue, parsedValue);
          },
          defaultPaths: [...defaultPaths, key],
          message,
          errorType,
        });
      }

      return this._lazy(lazyCheckers);
    } else {
      const _lazyOptionSet = isArray(lazyOption) ? lazyOption : [lazyOption];
      return this._lazy([...(_lazyOptionSet as LazyType<Type>[])]);
    }
  }

  default(defaultValue: TypeDefaultValue<Type>) {
    this._defaultValue = defaultValue;
    return this;
  }

  get defaultValue() {
    return this._defaultValue;
  }

  get type() {
    return this._type;
  }
}
