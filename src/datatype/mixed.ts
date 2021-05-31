import { isObject, omit, pick } from "vcc-utils";
import { IObject } from "../@types";
import { CoreType, CoreTypeConstructorParams, Types, ValueType } from "./base";

import {
  ErrorConstructorMessage,
  ErrorSet,
  InvalidFieldError,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from "../error";
import { typeOf } from "../utils/type";

export class MixedType<
  TypeMap extends IObject<CoreType<any>>,
  Keys extends keyof TypeMap
> extends CoreType<{ [key in keyof TypeMap]: ValueType<TypeMap[key]> }> {
  childrenPropertyTypes: { [key in Keys]: CoreType<any> };

  _strict?: boolean;

  constructor(
    props: CoreTypeConstructorParams & {
      strict?: boolean;
      childrenPropertyTypes: TypeMap;
    }
  ) {
    super(props);
    this._strict = props.strict ?? true;
    this.childrenPropertyTypes = props.childrenPropertyTypes;
  }

  static create = <
    TypeMap extends IObject<CoreType<any>>,
    Keys extends keyof TypeMap
  >(
    types: TypeMap,
    options?: {
      error?: ErrorConstructorMessage<InvalidTypeErrorPayload>;
      strict?: boolean;
    }
  ) => {
    const strict = options?.strict ?? true;

    return new MixedType<TypeMap, Keys>({
      type: Types.mixed,
      defaultCheckers: [
        (value: any, { ctx: { paths } }) => {
          const isValidObject = isObject(value);
          if (isValidObject) return true;

          return new InvalidTypeError({
            expectedType: Types.mixed,
            receivedType: typeOf(value),
            message: options?.error,
            paths,
          });
        },
        (value: any, { ctx: { paths, ...otherCtxState } }) => {
          let returnValue = value;
          const errorSubject = new ErrorSet();

          if (strict) {
            const rawObjectKeys = Object.keys(value);
            const propertyCheckerKeys = Object.keys(types);
            const diffKeys = rawObjectKeys.filter(
              (key) => !propertyCheckerKeys.includes(key)
            );
            if (diffKeys.length > 0) {
              errorSubject.addErrors(
                diffKeys.map(
                  (key) =>
                    new InvalidFieldError({
                      invalidFieldPaths: key,
                      paths: [...paths, key],
                    })
                )
              );
            }
          }
          for (const key in types) {
            if (Object.prototype.hasOwnProperty.call(types, key)) {
              const propertySubjectChecker = types[key];

              let propertyValue = value[key];
              try {
                propertyValue = propertySubjectChecker.parser(propertyValue, {
                  ...otherCtxState,
                  paths: [...paths, key],
                });

                returnValue[key] = propertyValue;
              } catch (error) {
                errorSubject.addErrors((error as ErrorSet).errors);
              }
            }
          }

          if (!errorSubject.isEmpty) {
            return errorSubject;
          }

          return returnValue;
        },
      ],
      childrenPropertyTypes: types,
      strict,
    });
  };

  pick(
    keys: Keys[] = [],
    options?: {
      error?: ErrorConstructorMessage<InvalidTypeErrorPayload>;
      strict?: boolean;
    }
  ) {
    const childrenPropertyTypes = this.childrenPropertyTypes;
    const newChildrenPropertyTypes = pick(childrenPropertyTypes, keys);

    return MixedType.create<Pick<TypeMap, Keys>, keyof Pick<TypeMap, Keys>>(
      newChildrenPropertyTypes as Pick<TypeMap, Keys>,
      { strict: this._strict, ...options }
    );
  }

  omit(
    keys: Keys[] = [],
    options?: {
      error?: ErrorConstructorMessage<InvalidTypeErrorPayload>;
      strict?: boolean;
    }
  ) {
    const childrenPropertyTypes = this.childrenPropertyTypes;
    const newChildrenPropertyTypes = omit(childrenPropertyTypes, keys);

    return MixedType.create<
      Pick<TypeMap, Exclude<keyof TypeMap, Keys>>,
      keyof Pick<TypeMap, Exclude<keyof TypeMap, Keys>>
    >(newChildrenPropertyTypes as Omit<TypeMap, Keys>, {
      strict: this._strict,
      ...options,
    });
  }

  get children() {
    return this.childrenPropertyTypes;
  }

  strict(
    strict: boolean,
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ) {
    return MixedType.create(this.childrenPropertyTypes, {
      strict,
      error,
    });
  }
}

export const mixed = MixedType.create;
