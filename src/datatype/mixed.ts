import { isObject } from "hardcore-react-utils";
import { IObject } from "../@types";
import {
  BaseType,
  ErrorCode,
  ICheckSubject,
  ICheckTypeError,
  makeErrorSubject,
  SchemaDefine,
  Types,
  ValueType,
} from "../core";

export interface MixedSchemeTypeDefine extends SchemaDefine {
  type: Types.mixed;
}

export const defaultMixedCheckSubject: ICheckSubject<Types.mixed, IObject> = {
  checker: isObject,
  error: (builderPayload) =>
    makeErrorSubject({
      fieldPath: builderPayload.fieldPath,
      code: ErrorCode.invalid_type,
      receiveType: builderPayload.receiveType,
      rightType: Types.mixed,
    }),
  type: Types.mixed,
};

export class MixedType<TypeMap extends IObject> extends BaseType<
  { [key in keyof TypeMap]: ValueType<TypeMap[key]> },
  MixedSchemeTypeDefine
> {
  static create = <TypeMap extends IObject<BaseType<unknown, any>>>(
    types?: TypeMap,
    errorOptions?: ICheckTypeError<Types.number>
  ) => {
    return new MixedType<TypeMap>({
      type: Types.mixed,
      checkers: [
        defaultMixedCheckSubject,
        {
          type: Types.mixed,
          childrenPropertyChecker: types,
          error: errorOptions,
        },
      ],
    });
  };
}

export const mixed = MixedType.create;
