import { isObject, omit, pick } from "vcc-utils";
import { ICallback, IObject, NotUndefined } from "../@types";
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
  childrenPropertyTypes: TypeMap;

  _strict?: boolean;

  constructor(
    props: CoreTypeConstructorParams<
      { [key in keyof TypeMap]: ValueType<TypeMap[key]> }
    > & {
      strict?: boolean;
      childrenPropertyTypes: TypeMap;
    }
  ) {
    super(props);
    this._strict = props.strict ?? true;
    this.childrenPropertyTypes = props.childrenPropertyTypes;
  }

  static create = <
    TypeMap extends IObject<ValueType<CoreType<any>>>,
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
            prerequisite: true,
          });
        },
        (value: any, { ctx: { paths, ...otherCtxState } }) => {
          let returnValue = value;
          const errorSubject = new ErrorSet();

          if (strict && !otherCtxState.tryParser) {
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
              const propertyValue = value[key];

              const propertyValueOrError = propertySubjectChecker.parser(
                propertyValue,
                {
                  ...otherCtxState,
                  tryParser: otherCtxState.deepTryParser
                    ? otherCtxState.tryParser
                    : false,
                  paths: [...paths, key],
                  nestedParser: true,
                }
              );
              if (propertyValueOrError instanceof ErrorSet) {
                errorSubject.addErrors(
                  (propertyValueOrError as ErrorSet).errors
                );
                if (otherCtxState.tryParser) returnValue[key] = undefined;
              } else {
                returnValue[key] = propertyValueOrError;
              }
            }
          }

          if (!errorSubject.isEmpty && !otherCtxState.tryParser) {
            return errorSubject;
          }

          return returnValue;
        },
      ],
      childrenPropertyTypes: types,
      strict,
    });
  };

  get children() {
    return this.childrenPropertyTypes;
  }

  pick<K extends keyof TypeMap>(
    keys: K[] = [],
    options?: {
      error?: ErrorConstructorMessage<InvalidTypeErrorPayload>;
      strict?: boolean;
    }
  ) {
    const childrenPropertyTypes = this.childrenPropertyTypes;
    const newChildrenPropertyTypes = pick(childrenPropertyTypes, keys);

    return MixedType.create(newChildrenPropertyTypes, {
      strict: this._strict,
      ...options,
    });
  }

  omit<K extends keyof TypeMap>(
    keys: K[] = [],
    options?: {
      error?: ErrorConstructorMessage<InvalidTypeErrorPayload>;
      strict?: boolean;
    }
  ) {
    const childrenPropertyTypes = this.childrenPropertyTypes;
    const newChildrenPropertyTypes = omit(childrenPropertyTypes, keys);

    return MixedType.create(newChildrenPropertyTypes, {
      strict: this._strict,
      ...options,
    });
  }

  modifiers<
    Modifiers extends {
      [key in Keys]?: ICallback<CoreType<unknown>, [base: TypeMap[key]]>;
    },
    ModifiersTypeValue extends {
      [key in keyof Modifiers]: ReturnType<NotUndefined<Modifiers[key]>>;
    }
  >(childrens: Modifiers) {
    const { childrenPropertyTypes: currentChildrenTypes } = this;
    const modifiedChildren = {} as ModifiersTypeValue;

    for (const key in childrens) {
      const childTransform = childrens[key];
      const currentChildType = currentChildrenTypes[key];
      if (childTransform) {
        modifiedChildren[key] = childTransform(
          currentChildType
        ) as ModifiersTypeValue[Extract<keyof Modifiers, string>];
      }
    }

    const children = {
      ...currentChildrenTypes,
      ...modifiedChildren,
    };

    return MixedType.create(children, {
      strict: this._strict,
    });
  }

  pickAndModifers<
    PickModifiers extends {
      [key in Keys]?: ICallback<CoreType<unknown>, [base: TypeMap[key]]>;
    },
    PickModifiersTypeValue extends {
      [key in keyof PickModifiers]: ReturnType<
        NotUndefined<PickModifiers[key]>
      >;
    }
  >(childrens: PickModifiers) {
    const { childrenPropertyTypes: currentChildrenTypes } = this;
    const modifiedChildren = {} as PickModifiersTypeValue;

    for (const key in childrens) {
      const childTransform = childrens[key];
      const currentChildType = currentChildrenTypes[key];
      if (childTransform) {
        modifiedChildren[key] = childTransform(
          currentChildType
        ) as PickModifiersTypeValue[Extract<keyof PickModifiers, string>];
      }
    }

    return MixedType.create(modifiedChildren, {
      strict: this._strict,
    });
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
