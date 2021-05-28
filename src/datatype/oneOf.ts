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
          const errorSubject = new ErrorSet();
          const expectedType = types.map(({ type }) => type);
          const receivedType = typeOf(value);

          const hasSomeonePassed = types.some((type) => {
            try {
              type.parser(value, { ...ctx });
              return true;
            } catch (error) {
              errorSubject.addErrors((error as ErrorSet).errors);
              return false;
            }
          });

          if (hasSomeonePassed) return true;
          const notInvaidTypeError: ErrorSubject[] = [];
          errorSubject.errors.forEach((_error, index) => {
            if (!InvalidTypeError.is(_error)) {
              if (error) {
                errorSubject.errors[index] = new InvalidUnionTypeError({
                  expectedType,
                  receivedType,
                  message: error,
                  paths: ctx.paths,
                });
              }

              notInvaidTypeError.push(errorSubject.errors[index]);
            }
          });

          if (notInvaidTypeError.length > 0)
            return new ErrorSet(notInvaidTypeError);

          return new InvalidUnionTypeError({
            expectedType,
            receivedType,
            message: error,
            paths: ctx.paths,
          });
        },
      ],
    });
  };
}

export const oneOf = OneOfType.create;
