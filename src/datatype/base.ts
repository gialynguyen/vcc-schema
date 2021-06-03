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
import { DeepPartial, IObject, NoneDeepPartial } from "../@types";
import { isArray } from "vcc-utils";
import { ErrorSet, ErrorSubject } from "../error";

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

export type ValueType<Type> = Type extends CoreType<infer T>
  ? ReturnType<Type["parser"]>
  : never;

export type ErrorType<Type> = Type extends IObject
  ? { [key in keyof Type]: ErrorType<Type[key]> }
  : Type extends any[]
  ? ErrorType<Type[number]>
  : ErrorSubject;

export interface CoreTypeConstructorParams<Type> {
  defaultCheckers: Checker[];
  type: Types;
  defaultLazyCheckers?: Type extends IObject
    ? LazyObjectType<any>[]
    : LazyType<any>[];
}

export abstract class CoreType<Type> {
  protected _type: Types;

  protected _checkers: Checker[];

  protected _lazyCheckers: LazyType<any>[];

  parser: (raw: any, ctx?: ParserContext) => Type;

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

  validate: (raw: any) => { success: boolean; data?: Type; error?: ErrorSet };

  constructor(params: CoreTypeConstructorParams<Type>) {
    this._checkers = params.defaultCheckers || [];
    this._type = params.type;
    this._lazyCheckers = params.defaultLazyCheckers || ([] as any);

    this.parser = runnerParser({
      checkers: this._checkers,
      lazyCheckers: this._lazyCheckers,
    });

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
  }

  _extends(payload: { checkers?: Checker[]; lazy?: LazyType<Type>[] }): this {
    return new (this as any).constructor({
      defaultCheckers: [...this._checkers, ...(payload.checkers || [])],
      defaultLazyCheckers: [...this._lazyCheckers, ...(payload.lazy || [])],
      type: this._type,
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
        if (Object.prototype.hasOwnProperty.call(lazyOption, key)) {
          const {
            checker,
            defaultPaths = [],
            ...otherOptions
          } = lazyOption[key] as LazyObjectTypeChecker<Type, keyof Type>;
          lazyCheckers.push({
            checker: (parsedValue: Type) => {
              const fieldValue = (parsedValue as any)[key];
              return checker(fieldValue, parsedValue);
            },
            defaultPaths: [...defaultPaths, key],
            ...otherOptions,
          });
        }
      }

      return this._lazy(lazyCheckers);
    } else {
      const _lazyOptionSet = isArray(lazyOption) ? lazyOption : [lazyOption];
      return this._lazy([...(_lazyOptionSet as LazyType<Type>[])]);
    }
  }

  get type() {
    return this._type;
  }
}
