import { omit, pick, isObject } from "vcc-utils";
import {
  ICallback,
  IObject,
  NotUndefined,
  ObjectWithoutNullishProperty,
} from "../@types";
import { CoreType, CoreTypeConstructorParams, Types, ValueType } from "./base";

import {
  ErrorConstructorMessage,
  ErrorSubject,
  InvalidFieldError,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from "../error";

import { typeOf } from "../utils/type";

type PickBySchemaMap<TypeMap> = {
  [Key in keyof TypeMap]?: TypeMap[Key] extends MixedType<any, any>
    ? PickBySchemaMap<TypeMap[Key]["children"]>
    : boolean;
};

type PickByMixedType<Origin, Schema> = Origin extends MixedType<any, any>
  ? Pick<
      Origin["children"],
      {
        [Key in keyof Schema]-?: Key extends keyof Origin["children"]
          ? Schema[Key] extends Exclude<boolean, false>
            ? Key
            : never
          : never;
      }[keyof Schema]
    > &
      ObjectWithoutNullishProperty<
        {
          [Key in keyof Origin["children"]]: Key extends keyof Schema
            ? Origin["children"][Key] extends MixedType<any, any>
              ? MixedType<PickByMixedType<Origin["children"][Key], Schema[Key]>>
              : PickByMixedType<Origin["children"][Key], Schema[Key]>
            : undefined;
        }
      >
  : Origin;

type OmitByMixedType<Origin, Schema> = Origin extends MixedType<any, any>
  ? Omit<
      {
        [Key in keyof Origin["children"]]: Key extends keyof Schema
          ? Origin["children"][Key] extends MixedType<any, any>
            ? MixedType<OmitByMixedType<Origin["children"][Key], Schema[Key]>>
            : Origin["children"][Key]
          : Origin["children"][Key];
      },
      {
        [Key in keyof Schema]-?: Key extends keyof Origin["children"]
          ? Schema[Key] extends Exclude<boolean, false>
            ? Key
            : never
          : never;
      }[keyof Schema]
    >
  : Schema extends Exclude<boolean, false>
  ? never
  : Origin;

export class MixedType<
  TypeMap extends IObject<CoreType<any>>,
  Keys extends keyof TypeMap = keyof TypeMap
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
            inputData: value,
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

  pickBy<Schema extends PickBySchemaMap<TypeMap>>(
    pickSchema: Schema,
    options?: {
      error?: ErrorConstructorMessage<InvalidTypeErrorPayload>;
      strict?: boolean;
    }
  ): MixedType<
    PickByMixedType<this, Schema>,
    keyof PickByMixedType<this, Schema>
  > {
    const childrenPropertyTypes = this.childrenPropertyTypes;
    const newChildrenPropertyTypes: any = {};

    for (const key in pickSchema) {
      const childrenType = childrenPropertyTypes[key];
      const currentPickedSchema = pickSchema[key];

      if (!childrenType) continue;
      if (childrenType instanceof MixedType && isObject(currentPickedSchema)) {
        newChildrenPropertyTypes[key] = childrenType.pickBy(
          currentPickedSchema as any
        );
      } else if (currentPickedSchema === true) {
        newChildrenPropertyTypes[key] = childrenType;
      }
    }

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

  omitBy<Schema extends PickBySchemaMap<TypeMap>>(
    omitSchema: Schema,
    options?: {
      error?: ErrorConstructorMessage<InvalidTypeErrorPayload>;
      strict?: boolean;
    }
  ): MixedType<
    OmitByMixedType<this, Schema>,
    keyof OmitByMixedType<this, Schema>
  > {
    const childrenPropertyTypes = this.childrenPropertyTypes;
    const newChildrenPropertyTypes: any = {};

    for (const key in childrenPropertyTypes) {
      const childrenType = childrenPropertyTypes[key];
      if (key in omitSchema) {
        const currentOmittedSchema = omitSchema[key];
        if (
          childrenType instanceof MixedType &&
          isObject(currentOmittedSchema)
        ) {
          newChildrenPropertyTypes[key] = childrenType.omitBy(
            currentOmittedSchema as any
          );
        } else if (currentOmittedSchema !== true) {
          newChildrenPropertyTypes[key] = childrenType;
        }
      } else {
        newChildrenPropertyTypes[key] = childrenType;
      }
    }

    return MixedType.create(newChildrenPropertyTypes, {
      strict: this._strict,
      ...options,
    });
  }

  modify<
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

  pickAndModify<
    PickKeys extends Keys,
    PickModifiers extends {
      [key in PickKeys]?:
        | ICallback<CoreType<unknown>, [base: TypeMap[key]]>
        | boolean;
    },
    PickModifiersTypeValue extends {
      [key in keyof PickModifiers]: PickModifiers[key] extends boolean
        ? PickModifiers[key] extends Exclude<boolean, false>
          ? key extends Keys
            ? TypeMap[key]
            : never
          : never
        : ReturnType<NotUndefined<PickModifiers[key]>>;
    }
  >(childrens: PickModifiers) {
    const { childrenPropertyTypes: currentChildrenTypes } = this;
    const modifiedChildren = {} as PickModifiersTypeValue;

    for (const key in childrens) {
      const childTransform = childrens[key];
      const currentChildType = currentChildrenTypes[key];
      if (childTransform) {
        if (typeof childTransform === "boolean" && childTransform === true) {
          modifiedChildren[key] =
            currentChildType as unknown as PickModifiersTypeValue[Extract<
              keyof PickModifiers,
              string
            >];
        } else {
          modifiedChildren[key] = childTransform(
            currentChildType
          ) as PickModifiersTypeValue[Extract<keyof PickModifiers, string>];
        }
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
