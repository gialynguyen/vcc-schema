import { isArray } from "vcc-utils";
import { CoreType, Types, ValueType } from "./base";
import { typeOf } from "../utils/type";
import {
  ErrorConstructorMessage,
  ErrorSubject,
  IncorrectSizeError,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from "../error";

export class TuplesType<TypeSet extends Array<CoreType<any>>> extends CoreType<
  ValueType<TypeSet[number]>
> {
  static create = <TypeSet extends Array<CoreType<any>>>(
    types: TypeSet,
    options?: {
      error?: ErrorConstructorMessage<InvalidTypeErrorPayload>;
      strict?: boolean;
    }
  ) => {
    return new TuplesType<TypeSet>({
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
          const valueLength = value.length;
          const typesLength = types.length;
          const returnValue = value;
          const throwOnFirstError = ctx.throwOnFirstError && !ctx.tryParser;
          let errors: ErrorSubject[] = [];

          if (valueLength > typesLength) {
            return new IncorrectSizeError({
              expectedSize: typesLength,
              receivedSize: valueLength,
              inputData: value,
            });
          }

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
