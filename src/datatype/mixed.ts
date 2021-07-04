import { omit, pick, isObject } from "vcc-utils";
import { ICallback, IObject, NotUndefined } from "../@types";
import { CoreType, CoreTypeConstructorParams, Types, ValueType } from "./base";

import {
  ErrorConstructorMessage,
  ErrorSet,
  ErrorSubject,
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
        (value: any, { ctx }) => {
          let returnValue = value;
          let errors: ErrorSubject[] = [];
          const throwOnFirstError = ctx.throwOnFirstError && !ctx.tryParser;

          if (strict && !ctx.tryParser) {
            const rawObjectKeys = Object.keys(value);
            const propertyCheckerKeys = Object.keys(types);
            const diffKeys: string[] = [];
            for (let index = 0; index < rawObjectKeys.length; index++) {
              const key = rawObjectKeys[index];
              if (!propertyCheckerKeys.includes(key)) {
                diffKeys.push(key);
                if (throwOnFirstError) break;
              }
            }

            if (diffKeys.length > 0) {
              errors = errors.concat(
                diffKeys.map(
                  (key) =>
                    new InvalidFieldError({
                      invalidFieldPaths: key,
                      paths: [...ctx.paths, key],
                    })
                )
              );
            }
          }

          if (errors.length && throwOnFirstError) {
            return errors;
          }

          for (const key in types) {
            const propertySubjectChecker = types[key];
            const propertyValue = value[key];

            const propertyValueOrError = propertySubjectChecker.parser(
              propertyValue,
              {
                deepTryParser: ctx.deepTryParser,
                tryParser: ctx.deepTryParser ? ctx.tryParser : false,
                paths: [...ctx.paths, key],
                nestedParser: true,
                throwOnFirstError: ctx.throwOnFirstError,
              }
            );

            if (ErrorSubject.isArrayErrorSubject(propertyValueOrError)) {
              errors = errors.concat(propertyValueOrError);
              if (ctx.tryParser) returnValue[key] = undefined;
              if (throwOnFirstError) break;
            } else {
              returnValue[key] = propertyValueOrError;
            }
          }

          if (errors.length && !ctx.tryParser) {
            return errors;
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

  extends<ExtendsFields extends IObject<ValueType<CoreType<unknown>>>>(
    fields: ExtendsFields
  ) {
    return MixedType.create(
      { ...fields, ...this.childrenPropertyTypes },
      {
        strict: this._strict,
      }
    );
  }
}

export const mixed = MixedType.create;
