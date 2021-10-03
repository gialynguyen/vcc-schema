import { isArray } from "vcc-utils";
import { DeepPartial, ICallback, IObject, NoneDeepPartial } from "../@types";
import { ErrorSet } from "../error";
import {
  Checker,
  LazyObjectType,
  LazyObjectTypeChecker,
  LazyType,
  ParserContext,
  runnerParser,
} from "../parser";
import {
  array,
  ArrayType,
  nullable,
  NullType,
  oneOf,
  OneOfType,
  TuplesType,
  undefinedType,
  UndefinedType,
} from "./";

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
  record = "record",
}

export type ValueType<Type> = Type extends TuplesType<any>
  ? ReturnType<Type["parser"]>
  : Type extends CoreType<any>
  ? ReturnType<Type["parser"]>
  : Type extends CoreType<any[]>
  ? ReturnType<Type["parser"]>
  : never;

export type DefaultValueType<Type> = Type | ICallback<Type>;
export interface CoreTypeConstructorParams<Type> {
  defaultCheckers: Checker<Type>[];
  type: Types;
  defaultValue?: DefaultValueType<Type>;
  defaultLazyCheckers?: Type extends IObject
    ? LazyObjectType<any>[]
    : LazyType<any>[];
}

export abstract class CoreType<Type> {
  protected _type: Types;

  protected _checkers: Checker<Type>[];

  protected _lazyCheckers: LazyType<any>[];

  protected _defaultValue?: DefaultValueType<Type>;

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
  ) =>
    | { success: true; data: Type; error: null }
    | { success: false; data: null; error: ErrorSet };

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
          error: null,
        };
      } catch (error) {
        return {
          success: false,
          error: error as ErrorSet,
          data: null,
        };
      }
    };

    this.optional = () => {
      return oneOf([this, undefinedType()]);
    };

    this.nullable = (): OneOfType<[this, NullType]> => {
      return oneOf([this, nullable()]);
    };

    this.array = () => array(this);

    this.nullish = (): OneOfType<[this, NullType, UndefinedType]> => {
      return oneOf([this, nullable(), undefinedType()]);
    };
  }

  _extends(payload: {
    checkers?: Checker<Type>[];
    lazy?: LazyType<Type>[];
  }): this {
    return new (this as any).constructor({
      defaultCheckers: [...this._checkers, ...(payload.checkers || [])],
      defaultLazyCheckers: [...this._lazyCheckers, ...(payload.lazy || [])],
      type: this._type,
      defaultValue: this._defaultValue,
    });
  }

  check(checker: Checker<Type>): this {
    return this._extends({
      checkers: [...this._checkers, checker],
    });
  }

  _lazy(lazyOption: LazyType<any>[]): this {
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

  default(defaultValue: DefaultValueType<Type>): this {
    this._defaultValue = defaultValue;
    return this;
  }

  get defaultValue(): DefaultValueType<Type> | undefined {
    return this._defaultValue;
  }

  get type(): Types {
    return this._type;
  }
}
