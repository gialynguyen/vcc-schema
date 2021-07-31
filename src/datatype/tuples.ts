import { isArray } from "vcc-utils";
import { CoreType, Types, ValueType } from "./base";
import { typeOf } from "../utils/type";
import {
  ErrorConstructorMessage,
  ErrorSubject,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from "../error";

export class TuplesType<TypeMap extends Array<CoreType<any>>> extends CoreType<
  ValueType<TypeMap[number]>
> {
  static create = <TypeMap extends Array<CoreType<any>>>(
    types: TypeMap,
    options?: {
      error?: ErrorConstructorMessage<InvalidTypeErrorPayload>;
      strict?: boolean;
    }
  ) => {
    return new TuplesType<TypeMap>({
      type: Types.tuples,
      defaultCheckers: [
        (value: any, { ctx: { paths } }) => {
          const isValidArray = isArray(value);
          if (isValidArray) return true;

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
          const returnValue = value;
          let errors: ErrorSubject[] = [];
          const throwOnFirstError = ctx.throwOnFirstError && !ctx.tryParser;

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
