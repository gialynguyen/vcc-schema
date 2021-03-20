import { SchemaTypeParser } from '../types';

export interface ArrayTypeOptions<R> {
  safeMode?: boolean;
  defaultValue?: Array<R>;
}

export function ArrayType<R>(parser: SchemaTypeParser<R>, options?: ArrayTypeOptions<R>) {
  return (value: any, extraConfig?: any): Array<R> => {
    const mergeConfig = {
      ...extraConfig,
      ...options,
    }
    const dataFieldValueIsArray = Array.isArray(value);
    if (!dataFieldValueIsArray) {
      if (mergeConfig?.safeMode) return mergeConfig?.defaultValue || [];
      return undefined;
    }

    return value.map((itemValue) => parser(itemValue, mergeConfig));
  };
}
