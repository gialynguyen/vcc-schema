import {
  ErrorConstructorMessage,
  ErrorSet,
  ErrorSubject,
  InvalidTypeError,
  InvalidUnionTypeError,
  InvalidUnionTypeErrorPayload,
} from "../error";
import { typeOf } from "../utils/type";
import { CoreType, Types, ValueType } from "./base";

export class OneOfType<
  TypeSet extends Array<CoreType<unknown>>
> extends CoreType<ValueType<TypeSet[number]>> {
  static create = <TypeSet extends Array<CoreType<unknown>>>(
    types: TypeSet,
    error?: ErrorConstructorMessage<InvalidUnionTypeErrorPayload>
  ) => {
    return new OneOfType<TypeSet>({
      type: Types.oneOf,
      defaultCheckers: [
        (value: any, { ctx }) => {
          let errors: ErrorSubject[] = [];
          const expectedType = types.map(({ type }) => type);
          const receivedType = typeOf(value);
          let hasSomeonePassed = false;

          for (let index = 0; index < types.length; index++) {
            const type = types[index];
            const validOrError: any = type.parser(value, {
              deepTryParser: ctx.deepTryParser,
              tryParser: ctx.tryParser,
              paths: ctx.paths,
              nestedParser: true,
              throwOnFirstError: ctx.throwOnFirstError,
            });


            if (ErrorSubject.isArrayErrorSubject(validOrError)) {
              errors = errors.concat(validOrError);
            } else {
              hasSomeonePassed = true;
              break;
            }
          }
          
          if (hasSomeonePassed) return true;

          const notInvaidTypeError: ErrorSubject[] = [];

          for (let index = 0; index < errors.length; index++) {
            const _error = errors[index];
            if (!InvalidTypeError.is(_error)) {
              if (error) {
                errors[index] = new InvalidUnionTypeError({
                  expectedType,
                  receivedType,
                  message: error,
                  paths: ctx.paths,
                });
              }

              notInvaidTypeError.push(errors[index]);
            }
          }

          if (notInvaidTypeError.length > 0) return notInvaidTypeError;

          return new InvalidUnionTypeError({
            expectedType,
            receivedType,
            message: error,
            paths: ctx.paths,
            prerequisite: true,
          });
        },
      ],
    });
  };
}

export const oneOf = OneOfType.create;
