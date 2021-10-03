export type IObject<T = any> = { [key: string]: T };
export type ICallback<R = any, Args extends unknown[] = any[]> = (
  ...args: Args
) => R;

export type NotUndefined<T> = T extends undefined ? never : T;

export type ICheckerFunction = ICallback<boolean, any[]>;

export type NoneDeepPartial<Type> = Type extends IObject
  ? { [key in keyof Type]?: Type[key] }
  : Type extends any[]
  ? Type[number]
  : Type | undefined;

export type DeepPartial<T> = T extends Function
  ? T
  : T extends object
  ? T extends unknown[]
    ? DeepPartial<T[number]>[]
    : { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

export type Nullish = never | undefined | null | void;

export type ObjectWithoutNullishProperty<O extends IObject> = Pick<
  O,
  {
    [Key in keyof O]-?: Key extends keyof O
      ? O[Key] extends Nullish
        ? never
        : Key
      : never;
  }[keyof O]
>;

export type Primitive =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | Symbol;

export type Writable<T> = { -readonly [P in keyof T]: T[P] };
