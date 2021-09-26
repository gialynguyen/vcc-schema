import { isArray } from "vcc-utils";
import { DeepPartial, ICallback, IObject, NoneDeepPartial } from "../@types";
import {
  ErrorExtendSubjectClass,
  ErrorSet,
  ErrorSubject as ErrorSubjectBase,
} from "../error";
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

export type ErrorType<Type> = Type extends IObject
  ? { [key in keyof Type]: ErrorType<Type[key]> }
  : Type extends any[]
  ? ErrorType<Type[number]>
  : ErrorSubjectBase;

export type TypeDefaultValue<Type> = Type | ICallback<Type>;

export type TypeErrorHandler<ErrorSubject extends ErrorExtendSubjectClass> = (
  ...payload: ConstructorParameters<ErrorSubject>
) => string | void;

export type TypeErrorMap = Map<ErrorExtendSubjectClass, TypeErrorHandler<any>>;
export interface CoreTypeConstructorParams<Type> {
  defaultCheckers: Checker<Type>[];
  type: Types;
  defaultValue?: DefaultValueType<Type>;
  defaultLazyCheckers?: Type extends IObject
    ? LazyObjectType<any>[]
    : LazyType<any>[];
  errorMessageMap?: TypeErrorMap;
}

export abstract class CoreType<Type> {
  protected _type: Types;

  protected _checkers: Checker<Type>[];

  protected _lazyCheckers: LazyType<any>[];

  protected _defaultValue?: DefaultValueType<Type>;

  protected _errorMessageMap: TypeErrorMap;

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

  getErrorMessageHandler: <ErrorSubject extends ErrorExtendSubjectClass>(
    errorSubject: ErrorSubject
  ) => TypeErrorHandler<any> | undefined;

  throwError: <ErrorSubject extends ErrorExtendSubjectClass>(
    errorSubject: ErrorSubject,
    payload: ConstructorParameters<ErrorSubject>[0]
  ) => ErrorSubjectBase;

  constructor(params: CoreTypeConstructorParams<Type>) {
    this._checkers = params.defaultCheckers || [];
    this._type = params.type;
    this._lazyCheckers = params.defaultLazyCheckers || ([] as any);
    this._errorMessageMap = new Map(params.errorMessageMap || []);

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

    this.getErrorMessageHandler = (errorSubject) => {
      const errorMessageHandler = this._errorMessageMap.get(errorSubject);
      if (errorMessageHandler) return errorMessageHandler;

      return this._errorMessageMap.get(ErrorSubjectBase);
    };

    this.throwError = (errorSubject, payload) => {
      const errorMessageHandler = this.getErrorMessageHandler(errorSubject);
      if (errorMessageHandler) {
        const errorMessage = errorMessageHandler(payload);
        if (errorMessage) {
          return new errorSubject({
            ...payload,
            message: errorMessage,
          });
        }
      }

      return new errorSubject({
        ...payload,
      });
    };
  }

  protected _extends(
    payload: Pick<CoreTypeConstructorParams<Type>, "errorMessageMap"> & {
      checkers?: Checker<Type>[];
      lazy?: LazyType<Type>[];
    }
  ): this {
    return new (this as any).constructor({
      defaultCheckers: [...this._checkers, ...(payload.checkers || [])],
      defaultLazyCheckers: [...this._lazyCheckers, ...(payload.lazy || [])],
      type: this._type,
      defaultValue: this._defaultValue,
      errorMessageMap: payload.errorMessageMap,
    });
  }

  check(checker: Checker<Type>): this {
    return this._extends({
      checkers: [...this._checkers, checker],
    });
  }

  _lazy(lazyOptions: LazyType<any>[]): this {
    return this._extends({
      lazy: [...this._lazyCheckers, ...lazyOptions],
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

  errorMessage<ErrorSubject extends ErrorExtendSubjectClass>(
    errorSubject: ErrorSubject,
    handler: TypeErrorHandler<ErrorSubject>
  ) {
    const errorMessageMap = new Map(this._errorMessageMap);
    errorMessageMap.set(errorSubject, handler);

    return this._extends({
      errorMessageMap,
    });
  }

  default(defaultValue: TypeDefaultValue<Type>) {
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
