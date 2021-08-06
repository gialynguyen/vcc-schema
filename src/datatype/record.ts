import { isObject } from "vcc-utils";
import { CoreType, Types, ValueType } from "./base";
import { typeOf } from "../utils/type";
import {
  ErrorConstructorMessage,
  ErrorSubject,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from "../error";
import { ArrayType } from "./array";
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
  ) => {
    return new RecordType<TypeSet>({
      type: Types.record,
      defaultCheckers: [
        (value: any, { ctx: { paths } }) => {
          const isValidObject = isObject(value);
          if (isValidObject) return true;

          return new InvalidTypeError({
            expectedType: Types.record,
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

          for (const key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
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
          }

          if (errors.length && !ctx.tryParser) {
            return errors;
          }

          return true;
        },
      ],
    });
  };
}

export const record = RecordType.create;