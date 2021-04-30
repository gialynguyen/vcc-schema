import { ICallback, ICheckerFunction, IObject } from "../@types";
import { ParseContext, runtimeParser, runtimeParserSilent } from "./parser";
import { BaseError, ErrorBuilderPayload, ErrorSubject } from "./error";
import {
  nullable,
  NullType,
  oneOf,
  OneOfType,
  undefined,
  UndefinedType,
  array,
  ArrayType,
} from "../datatype";

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
  error?: BaseError | ((params: ErrorBuilderPayload<Type>) => BaseError);
  options?: Options;
  type: Types;
  desc?: string;
  fieldPath?: string;
  childrenPropertyChecker?:
    | IObject<BaseType<unknown, any>>
    | BaseType<unknown, any>[];
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
  _checkers: ICheckSubject[];
  _initialSchemaDefine: SDef;
  _type: Types;
  _options?: Options;

  parser: (x: Type | unknown, context?: ParseContext) => Type;

  parserSilent: (
    x: Type | unknown,
    context?: ParseContext
  ) =>
    | { success: boolean; error: ErrorSubject; data?: undefined }
    | { success: boolean; data: any; error?: undefined };

  optional: () => OneOfType<[this, UndefinedType]>;
  nullable: () => OneOfType<[this, NullType]>;
  array: () => ArrayType<Type>;

  constructor(schemaDefine: SDef) {
    this._checkers = [...schemaDefine.checkers];

    this._initialSchemaDefine = schemaDefine;
    this._type = schemaDefine.type;
    this.parser = runtimeParser({
      checkers: this._checkers,
    });

    this._options = schemaDefine.options;

    this.parserSilent = runtimeParserSilent({
      checkers: this._checkers,
    });
    this.optional = () => oneOf([this, undefined()]);
    this.nullable = () => oneOf([this, nullable()]);
    this.array = () => array(this);
  }

  _extends = (payload: { checkers: ICheckSubject[] }): this => {
    return new (this as any).constructor({
      ...this._initialSchemaDefine,
      checkers: [...this._checkers, ...payload.checkers],
    });
  };

  joinCheckerDesc = () =>
    this._checkers.map(({ type, desc }) => desc || type).join(", ");
}
