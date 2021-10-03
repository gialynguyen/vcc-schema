import { isObject, omit, pick } from "vcc-utils";
import {
  ICallback,
  IObject,
  NotUndefined,
  ObjectWithoutNullishProperty,
} from "../@types";
import {
  ErrorConstructorMessage,
  ErrorSubject,
  InvalidFieldError,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from "../error";
import { typeOf } from "../utils/type";
import { CoreType, CoreTypeConstructorParams, Types, ValueType } from "./base";

type PickBySchemaMap<TypeMap> = {
  [Key in keyof TypeMap]?: TypeMap[Key] extends MixedType<any, any>
    ? PickBySchemaMap<TypeMap[Key]["children"]> | boolean
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
      ObjectWithoutNullishProperty<{
        [Key in keyof Origin["children"]]: Key extends keyof Schema
          ? Origin["children"][Key] extends MixedType<any, any>
            ? MixedType<PickByMixedType<Origin["children"][Key], Schema[Key]>>
            : PickByMixedType<Origin["children"][Key], Schema[Key]>
          : undefined;
      }>
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
    props: CoreTypeConstructorParams<{
      [key in keyof TypeMap]: ValueType<TypeMap[key]>;
    }> & {
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
  ): MixedType<TypeMap, Keys> => {
    const strict = options?.strict ?? true;

    return new MixedType<TypeMap, Keys>({
      type: Types.mixed,
      defaultCheckers: [
        (
          value: any,
          { ctx: { paths } }
        ):
          | { [key in keyof TypeMap]: ValueType<TypeMap[key]> }
          | InvalidTypeError => {
          const isValidObject = isObject(value);

          if (isValidObject) return value;

          return new InvalidTypeError({
            expectedType: Types.mixed,
            receivedType: typeOf(value),
            message: options?.error,
            paths,
            prerequisite: true,
            inputData: value,
          });
        },
        (
          value: any,
          { ctx }
        ):
          | { [key in keyof TypeMap]: ValueType<TypeMap[key]> }
          | ErrorSubject[] => {
          let errors: ErrorSubject[] = [];
          let returnValue = value;

          const throwOnFirstError = ctx.throwOnFirstError && !ctx.tryParser;

          if (strict) {
            const rawObjectKeys = Object.keys(value);
            const propertyCheckerKeys = Object.keys(types);
            const diffKeys: string[] = [];
            for (let index = 0; index < rawObjectKeys.length; index++) {
              const key = rawObjectKeys[index];
              if (!propertyCheckerKeys.includes(key)) {
                if (!ctx.tryParser) {
                  diffKeys.push(key);
                  if (throwOnFirstError) break;
                } else {
                  delete returnValue[key];
                }
              }
            }

            if (diffKeys.length > 0 && !ctx.tryParser) {
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

  get children(): TypeMap {
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
      [key in Keys]?: ICallback<CoreType<any>, [base: TypeMap[key]]>;
    },
    ModifiersTypeValue extends {
      [key in keyof Modifiers]: ReturnType<NotUndefined<Modifiers[key]>>;
    }
  >(children: Modifiers) {
    const { childrenPropertyTypes: currentChildrenTypes } = this;
    const modifiedChildren = {} as ModifiersTypeValue;

    for (const key in children) {
      const childTransform = children[key];
      const currentChildType = currentChildrenTypes[key];
      if (childTransform) {
        modifiedChildren[key] = childTransform(
          currentChildType
        ) as ModifiersTypeValue[Extract<keyof Modifiers, string>];
      }
    }

    return MixedType.create(
      {
        ...currentChildrenTypes,
        ...modifiedChildren,
      },
      {
        strict: this._strict,
      }
    );
  }

  pickAndModify<
    PickKeys extends Keys,
    PickModifiers extends {
      [key in PickKeys]?:
        | ICallback<CoreType<any>, [base: TypeMap[key]]>
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
  >(children: PickModifiers) {
    const { childrenPropertyTypes: currentChildrenTypes } = this;
    const modifiedChildren = {} as PickModifiersTypeValue;

    for (const key in children) {
      const childTransform = children[key];
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

  extends<ExtendsFields extends IObject<ValueType<CoreType<any>>>>(
    fields: ExtendsFields
  ) {
    return MixedType.create(
      { ...fields, ...this.childrenPropertyTypes },
      {
        strict: this._strict,
      }
    );
  }

  merge<MergeFields extends IObject<ValueType<CoreType<any>>>>(
    fields: MergeFields
  ) {
    return MixedType.create(
      { ...this.childrenPropertyTypes, ...fields },
      {
        strict: this._strict,
      }
    );
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
