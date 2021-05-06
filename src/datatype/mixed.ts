import { isObject, omit, pick } from "hardcore-react-utils";
import { IObject } from "../@types";
import {
  BaseType,
  ICheckSubject,
  ICheckTypeError,
  SchemaDefine,
  Types,
  ValueType,
} from "./type";

import { ErrorCode, makeErrorSubject } from "../core";

export interface MixedSchemeTypeDefine<
  TypeMap extends IObject<BaseType<any, any>>,
  Keys extends keyof TypeMap = keyof TypeMap
> extends SchemaDefine {
  type: Types.mixed;
  strict?: boolean;
  childrenPropertyTypes: {
    [key in Keys]: TypeMap[key];
  };
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

const defaultMixedError = () =>
  makeErrorSubject({
    code: ErrorCode.custom_error,
  });

export class MixedType<
  TypeMap extends IObject<BaseType<any, any>>,
  Keys extends keyof TypeMap
> extends BaseType<
  { [key in keyof TypeMap]: ValueType<TypeMap[key]> },
  MixedSchemeTypeDefine<TypeMap, Keys>
> {
  childrenPropertyTypes: { [key in Keys]: BaseType<any, any> };
  strict?: boolean;

  constructor(props: MixedSchemeTypeDefine<TypeMap, Keys>) {
    super(props);
    this.strict = props.strict ?? true;
    this.childrenPropertyTypes = props.childrenPropertyTypes;
  }
  static create = <
    TypeMap extends IObject<BaseType<any, any>>,
    Keys extends keyof TypeMap
  >(
    types: TypeMap,
    options?: {
      errorOptions?: ICheckTypeError<Types.mixed>;
      strict?: boolean;
    }
  ) => {
    return new MixedType<TypeMap, Keys>({
      type: Types.mixed,
      checkers: [
        defaultMixedCheckSubject,
        {
          type: Types.mixed,
          error: options?.errorOptions || defaultMixedError,
        },
      ],
      childrenPropertyTypes: types,
      strict: options?.strict,
    });
  };

  pick(
    keys: Keys[] = [],
    options?: {
      errorOptions?: ICheckTypeError<Types.mixed>;
    }
  ) {
    const childrenPropertyTypes = this.childrenPropertyTypes;
    const newChildrenPropertyTypes = pick(childrenPropertyTypes, keys);

    return MixedType.create<Pick<TypeMap, Keys>, keyof Pick<TypeMap, Keys>>(
      newChildrenPropertyTypes as Pick<TypeMap, Keys>,
      options
    );
  }

  omit(
    keys: Keys[] = [],
    options?: {
      errorOptions?: ICheckTypeError<Types.mixed>;
    }
  ) {
    const childrenPropertyTypes = this.childrenPropertyTypes;
    const newChildrenPropertyTypes = omit(childrenPropertyTypes, keys);

    return MixedType.create<
      Pick<TypeMap, Exclude<keyof TypeMap, Keys>>,
      keyof Pick<TypeMap, Exclude<keyof TypeMap, Keys>>
    >(newChildrenPropertyTypes as Omit<TypeMap, Keys>, options);
  }

  get children() {
    return this.childrenPropertyTypes;
  }
}

export const mixed = MixedType.create;
