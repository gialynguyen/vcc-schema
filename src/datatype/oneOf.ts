import {
  BaseType,
  ICheckTypeError,
  SchemaDefine,
  Types,
  ValueType,
} from "./type";

import { ErrorCode, ErrorSubject, makeErrorSubject } from "../core";

export interface OneOfSchemeTypeDefine extends SchemaDefine {
  type: Types.oneOf;
}

export class OneOfType<
  TypeSet extends Array<BaseType<unknown, any>>
> extends BaseType<ValueType<TypeSet[number]>, OneOfSchemeTypeDefine> {
  static create = <TypeSet extends Array<BaseType<unknown, any>>>(
    types: TypeSet,
    errorOptions?: ICheckTypeError<Types.number>
  ) => {
    let errorBuilder: ICheckTypeError<Types.number>;
    if (errorOptions) {
      errorBuilder = errorOptions;
    } else {
      errorBuilder = ({ receiveType, fieldPath }) =>
        makeErrorSubject({
          code: ErrorCode.invalid_type,
          fieldPath,
          message: `Expected ${types
            .map(({ joinCheckerDesc }) => joinCheckerDesc())
            .join(" or ")}, received ${receiveType}`,
        });
    }
    return new OneOfType<TypeSet>({
      type: Types.oneOf,
      checkers: [
        {
          type: Types.oneOf,
          checker: (raw: any) => {
            const errorSubject = new ErrorSubject();
            const hasSomeonePassed = types.some((type) => {
              const { success, error } = type.silentParser(raw);
              if (!success && error) {
                errorSubject.addErrors(error.errors);
              }

              return success;
            });

            const withoutInvalidType = errorSubject.errors.filter(
              ({ code }) => code !== ErrorCode.invalid_type
            );

            if (
              errorSubject.errors.length - withoutInvalidType.length !==
              types.length
            )
              throw new ErrorSubject(withoutInvalidType);

            return hasSomeonePassed;
          },
          error: errorBuilder,
        },
      ],
    });
  };
}

export const oneOf = OneOfType.create;
