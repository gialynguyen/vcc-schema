export type BeforeTransform<Output = unknown> = (input: unknown) => Output;
export type AfterTransform<Type> = (input: Type) => Type;
