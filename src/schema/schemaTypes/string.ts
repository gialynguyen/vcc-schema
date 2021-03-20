import { SchemaCreator } from '../types';

export interface StringTypeOptions {
  safeMode?: boolean;
  defaultValue?: string
}

export const String: SchemaCreator<string, StringTypeOptions> = (options?: StringTypeOptions) => {
  return (value: any, extraConfig?: any) => toString(value, { ...extraConfig, ...options });
}

export const toSafeString = (value: any, options?: { defaultValue: string }): string => {
  const valueType = typeof value;
  if (valueType === 'string') return value;

  if ((valueType === 'object' && value?.constructor === Object) || valueType === 'undefined')
    return options?.defaultValue || '';
  
  if (typeof value?.toString === 'function') return value.toString();

  return options?.defaultValue || '';
}

export const toString = (value: any, options?: { safeMode?: boolean, defaultValue?: string }): string => {
  if (options?.safeMode) {
    return toSafeString(value, { defaultValue: options?.defaultValue });
  }

  if (typeof value?.toString === 'function') return value.toString();
  return '' + value;
}