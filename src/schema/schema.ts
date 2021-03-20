import { Number, String, Mixed } from '.';
import { SchemaType } from './types';

export class Schema<O = {}> {
  schema: SchemaType<O>;
  constructor(schema: SchemaType<O>) {
    this.schema = schema;
  }
}

export const schemaParser = <O>(schema: Schema<O>, data: any, options?: { safeMode?: boolean }) => {
  const parserData = {};
  const schemas = schema.schema;
  for (const field of Object.keys(schemas)) {
    const schemaType = schemas[field];
    const dataFieldValue = data?.[field];
    parserData[field] = schemaType(dataFieldValue, options);
  }

  return parserData as {
    [key in keyof SchemaType<O>]: ReturnType<typeof schemas[key]>
  };
}

