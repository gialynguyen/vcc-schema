import { isArray } from "vcc-utils";
import {
    ErrorConstructorMessage,
    ErrorSubject,
    IncorrectSizeError,
    InvalidTypeError,
    InvalidTypeErrorPayload,
    SizeErrorPayload
} from "../error";
import { typeOf } from "../utils/type";
import { ArrayType } from "./array";
import { CoreType, Types, ValueType } from "./base";

export type ValueTypeTuples<
  T extends [
    CoreType<any>,
    ...(CoreType<any> | ArrayType<any> | ValueTypeTuples<any>)[]
  ]
> = {
  [k in keyof T]: T[k] extends TuplesType<any>
    ? ValueType<T[k]>
    : T[k] extends ArrayType<infer Item>
    ? ValueType<Item>[]
    : T[k] extends CoreType<any>
    ? ValueType<T[k]>
    : never;
};

export class TuplesType<
  TypeSet extends [
    CoreType<any>,
    ...(CoreType<any> | ArrayType<any> | ValueTypeTuples<any>)[]
  ]
> extends CoreType<ValueTypeTuples<TypeSet>> {
  static create = <
    TypeSet extends [
      CoreType<any>,
      ...(CoreType<any> | ArrayType<any> | ValueTypeTuples<any>)[]
    ]
  >(
    types: TypeSet,
    options?: {
      error?: ErrorConstructorMessage<
        InvalidTypeErrorPayload | SizeErrorPayload
      >;
      strict?: boolean;
    }
  ): TuplesType<TypeSet> => {
    return new TuplesType<TypeSet>({
      type: Types.tuples,
      defaultCheckers: [
        (
          value: any,
          { ctx: { paths } }
        ): ValueTypeTuples<TypeSet> | InvalidTypeError => {
          const isValidArray = isArray(value);
          if (isValidArray) return value;

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
        ): ErrorSubject[] | IncorrectSizeError | ValueTypeTuples<TypeSet> => {
          const valueLength = value.length;
          const typesLength = types.length;

          if (valueLength > typesLength) {
            return new IncorrectSizeError({
              expectedSize: typesLength,
              receivedSize: valueLength,
              inputData: value,
              message: options?.error,
            });
          }

          const returnValue = value;
          const throwOnFirstError = ctx.throwOnFirstError && !ctx.tryParser;
          let errors: ErrorSubject[] = [];

          for (let index = 0; index < types.length; index++) {
            const type = types[index];
            const rawItem = value[index];

            const rawItemOrError: any = type.parser(rawItem, {
              deepTryParser: ctx.deepTryParser,
              tryParser: ctx.deepTryParser ? ctx.tryParser : false,
              paths: [...ctx.paths, index],
              nestedParser: true,
              throwOnFirstError: ctx.throwOnFirstError,
            });

            if (ErrorSubject.isArrayErrorSubject(rawItemOrError)) {
              errors = errors.concat(rawItemOrError);
              if (ctx.tryParser) returnValue[index] = undefined;
              if (options?.strict || throwOnFirstError) break;
            } else {
              returnValue[index] = rawItemOrError;
            }
          }

          if (errors.length && !ctx.tryParser) {
            return errors;
          }

          return returnValue;
        },
      ],
    });
  };
}

export const tuples = TuplesType.create;
