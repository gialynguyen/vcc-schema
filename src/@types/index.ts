export type IObject<T = any> = { [key: string]: T };
export type ICallback<R = any, Args extends unknown[] = any[]> = (
  ...args: Args
) => R;

export type ICheckerFunction = ICallback<boolean, any[]>;

export type NoneDeepPartial<Type> = Type extends IObject
  ? { [key in keyof Type]?: Type[key] }
  : Type extends any[]
  ? Type[number]
  : Type | undefined;

export type DeepPartial<Type> = Type extends IObject
  ? { [key in keyof Type]?: DeepPartial<Type[key]> }
  : Type extends any[]
  ? DeepPartial<Type[number]>
  : Type | undefined;
