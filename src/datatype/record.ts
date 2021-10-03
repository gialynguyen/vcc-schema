import { isObject } from "vcc-utils";
import {
  ErrorConstructorMessage,
  ErrorSubject,
  InvalidTypeError,
  InvalidTypeErrorPayload
} from "../error";
import { typeOf } from "../utils/type";
import { ArrayType } from "./array";
import { CoreType, Types, ValueType } from "./base";
import { TuplesType } from "./tuples";

export type RecordInputType = CoreType<any> | ArrayType<any> | TuplesType<any>;

export type RecordOutputValue<Input extends RecordInputType> =
  Input extends TuplesType<any>
    ? ValueType<Input>
    : Input extends ArrayType<infer Item>
    ? ValueType<Item>[]
    : Input extends CoreType<any>
    ? ValueType<Input>
    : never;

export class RecordType<TypeSet extends RecordInputType> extends CoreType<
  Record<string, RecordOutputValue<TypeSet>>
> {
  static create = <TypeSet extends RecordInputType>(
    types: TypeSet,
    options?: {
      error?: ErrorConstructorMessage<InvalidTypeErrorPayload>;
      strict?: boolean;
    }
  ): RecordType<TypeSet> => {
    return new RecordType<TypeSet>({
      type: Types.record,
      defaultCheckers: [
        (
          value: any,
          { ctx: { paths } }
        ): Record<string, RecordOutputValue<TypeSet>> | InvalidTypeError => {
          const isValidObject = isObject(value);
          if (isValidObject) return value;

          return new InvalidTypeError({
            expectedType: Types.record,
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
        ): Record<string, RecordOutputValue<TypeSet>> | ErrorSubject[] => {
          let returnValue = value;
          let errors: ErrorSubject[] = [];
          const throwOnFirstError = ctx.throwOnFirstError && !ctx.tryParser;

          for (const key in value) {
            const propertyValue = value[key];

            const propertyValueOrError: any = types.parser(propertyValue, {
              deepTryParser: ctx.deepTryParser,
              tryParser: ctx.deepTryParser ? ctx.tryParser : false,
              paths: [...ctx.paths, key],
              nestedParser: true,
              throwOnFirstError: ctx.throwOnFirstError,
            });

            if (ErrorSubject.isArrayErrorSubject(propertyValueOrError)) {
              errors = errors.concat(propertyValueOrError);
              if (ctx.tryParser) returnValue[key] = undefined;
              if (options?.strict || throwOnFirstError) break;
            } else {
              returnValue[key] = propertyValueOrError;
            }
          }

          if (errors.length && !ctx.tryParser) {
            return errors;
          }

          return value;
        },
      ],
    });
  };
}

export const record = RecordType.create;
