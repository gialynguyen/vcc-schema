import { Schema, schemaParser } from '../schema';
import { SchemaType } from '../types';

export interface MixedTypeOptions {
  safeMode?: boolean;
  defaultValue?: number;
}

export function Mixed<O>(mixedSchema: SchemaType<O>, options?: MixedTypeOptions) {
  const schema = new Schema(mixedSchema);

  return (value: any, extraConfig?: any) => {
    const mergeConfig = {
      safeMode: true,
      ...extraConfig,
      ...options,
    }

    let _value = value;
    if (!_value && mergeConfig?.safeMode) _value = Object.assign({}, mergeConfig?.defaultValue || {});
    
    return schemaParser(schema, _value, extraConfig);
  }
}