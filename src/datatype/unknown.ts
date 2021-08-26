import { CoreType, Types } from "./base";

export class UnknownType extends CoreType<unknown> {
  static create = () => {
    return new UnknownType({
      type: Types.unknown,
      defaultCheckers: [(value) => value],
    });
  };
}

export const unknown = UnknownType.create;
