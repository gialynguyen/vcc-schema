import { SchemaCreator } from '../types';

export interface NumberTypeOptions {
  safeMode?: boolean;
  defaultValue?: number;
}

export const NumberType: SchemaCreator<number, NumberTypeOptions> = (options?: NumberTypeOptions) => {
  return (value: any, extraConfig?: any) => toNumber(value, { ...extraConfig, ...options});
}

export const toNumberSafe = (value: any, options?: { defaultValue?: number }) => {
  const valueAsNumber = Number(value);
  if (isNaN(valueAsNumber)) return options?.defaultValue || 0;

  return valueAsNumber;
}

export const toNumber = (value: any, options?: { safeMode?: boolean, defaultValue?: number }) => {
  if (options?.safeMode) return toNumberSafe(value, { defaultValue: options?.defaultValue })

  return Number(value);
}