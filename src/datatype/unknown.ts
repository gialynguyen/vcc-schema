import { CoreType, Types } from "./base";

export class UnknownType extends CoreType<unknown> {
  static create = () => {
    return new UnknownType({
      type: Types.unknown,
      defaultCheckers: [() => true],
    });
  };
}

export const unknown = UnknownType.create;
