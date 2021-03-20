import { SchemaType } from './types';

export class Schema<O = {}> {
  schema: SchemaType<O>;
  constructor(schema: SchemaType<O>) {
    this.schema = schema;
  }
}

export const schemaParser = <O>(schemaInstance: Schema<O>, data: any, options?: { safeMode?: boolean }) => {
  const parserData = {};
  const schema = schemaInstance.schema;
  for (const field of Object.keys(schema)) {
    const schemaTypeParser = schema[field];
    const dataFieldValue = data?.[field];
    parserData[field] = schemaTypeParser(dataFieldValue, options);
  }

  return parserData as {
    [key in keyof SchemaType<O>]: ReturnType<typeof schema[key]>
  };
}

