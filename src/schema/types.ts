export type SchemaType<O = {}> = {
  [field in keyof O]: SchemaTypeParser<O[field]>;
};


export type SchemaTypeParser<R = unknown> = (value: any, extraConfig?: any) => R;
export type SchemaCreator<R, O> = (options?: O) => SchemaTypeParser<R>;