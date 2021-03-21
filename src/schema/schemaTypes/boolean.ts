import { SchemaCreator } from '../types';

export interface BooleanTypeOptions {
  safeMode?: boolean;
  defaultValue?: boolean;
}

export const Boolean: SchemaCreator<boolean, BooleanTypeOptions> = (options?: BooleanTypeOptions) => {
  return (value: any, extraConfig?: any) => toBoolean(value, { ...extraConfig, ...options});
}

export const toSafeBoolean = (value: any, options?: { defaultValue: boolean }) => {
  if (typeof value !== 'boolean') return options?.defaultValue || false;

  return value;
}

export const toBoolean = (value: any, options?: { safeMode?: boolean, defaultValue?: boolean }) => {
  if (options?.safeMode) return toSafeBoolean(value, { defaultValue: options?.defaultValue })
  
  if (typeof value !== 'boolean') return false;

  return value;
}