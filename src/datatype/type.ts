import { ICallback, ICheckerFunction, IObject } from "../@types";
import {
  ErrorCodeType,
  ParseContext,
  runtimeParser,
  runtimeSilentParser,
} from "../core";
import { BaseError, ErrorBuilderPayload, ErrorSubject } from "../core";
import {
  nullable,
  NullType,
  oneOf,
  OneOfType,
  undefined,
  UndefinedType,
  array,
  ArrayType,
} from ".";

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

export type ICheckTypeError<Type extends Types> =
  | BaseError
  | ((params: ErrorBuilderPayload<Type>) => BaseError);

export interface ICheckSubject<
  Type extends Types = any,
  Options extends IObject = IObject,
  DataType = unknown
> {
  checker?: ICheckerFunction;
  error: ICheckTypeError<Type>;
  errorMessage?: string;
  options?: Options;
  type: Types;
  desc?: string;
  fieldPath?: string;
  transform?: ICallback<DataType, any[]>[];
}

export interface SchemaDefine<Options extends IObject = IObject> {
  type: Types;
  checkers: ICheckSubject[];
  options?: Options;
}

export type ValueType<Type extends BaseType<any, any>> = ReturnType<
  Type["parser"]
>;

export abstract class BaseType<
  Type,
  SDef extends SchemaDefine<Options>,
  Options extends IObject = IObject
> {
  _optional: boolean;

  _checkers: ICheckSubject[];

  _initialSchemaDefine: SDef;

  _type: Types;

  _options?: Options;

  _customError?: {
    [errorCode in ErrorCodeType]: ICheckTypeError<SDef["type"]>;
  };

  _customMessage?: {
    [errorCode in ErrorCodeType]: string;
  };

  parser: (x: Type | unknown, context?: ParseContext) => Type;

  silentParser: (
    x: Type | unknown,
    context?: ParseContext
  ) =>
    | { success: boolean; error: ErrorSubject; data?: undefined }
    | { success: boolean; data: any; error?: undefined };

  optional: () => OneOfType<[this, UndefinedType]>;

  nullable: () => OneOfType<[this, NullType]>;

  array: () => ArrayType<Type>;

  constructor(
    schemaDefine: SDef,
    options?: {
      customError: {
        [errorCode in ErrorCodeType]: ICheckTypeError<SDef["type"]>;
      };
      customMessage?: {
        [errorCode in ErrorCodeType]: string;
      };
    }
  ) {
    this._checkers = [...schemaDefine.checkers];

    this._initialSchemaDefine = schemaDefine;

    this._type = schemaDefine.type;

    this.parser = runtimeParser(this);

    this._options = schemaDefine.options;

    this.silentParser = runtimeSilentParser(this);

    this._optional = schemaDefine.options?.optional || false;

    this.optional = () => {
      const newTypeInstance = oneOf([this, undefined()]);
      newTypeInstance._optional = true;
      return newTypeInstance;
    };

    this.nullable = () => {
      const newTypeInstance = oneOf([this, nullable()]);
      newTypeInstance._optional = true;
      return newTypeInstance;
    };

    this._customError = options?.customError;
    this._customMessage = options?.customMessage;

    this.array = () => array(this);
  }

  _extends = (payload: { checkers: ICheckSubject[] }): this => {
    return new (this as any).constructor(
      {
        ...this._initialSchemaDefine,
        checkers: [...this._checkers, ...payload.checkers],
      },
      { customError: this._customError, customMessage: this._customMessage }
    );
  };

  error(
    error: {
      [errorCode in ErrorCodeType | string]: ICheckTypeError<SDef["type"]>;
    }
  ) {
    if (!this._customError) this._customError = {} as any;
    Object.assign(this._customError, error);
    return this;
  }

  errorMessage(error: { [errorCode in ErrorCodeType | string]: string }) {
    if (!this._customMessage) this._customMessage = {} as any;
    Object.assign(this._customMessage, error);
    return this;
  }

  joinCheckerDesc = () =>
    this._checkers.map(({ type, desc }) => desc || type).join(", ");
}
