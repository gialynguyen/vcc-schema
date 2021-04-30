export type IObject<T = any> = { [key: string]: T };
export type ICallback<R = any, Args extends unknown[] = any[]> = (
  ...args: Args
) => R;

export type ICheckerFunction = ICallback<boolean, any[]>;

export type PartialDeep<T> = {
  [P in keyof T]?: PartialDeep<T[P]>;
};

export type PartialRestoreArrays<K> = {
  [P in keyof K]?: K[P];
};

export type DeepPartial<T, K = any> = PartialDeep<T> & PartialRestoreArrays<K>;
