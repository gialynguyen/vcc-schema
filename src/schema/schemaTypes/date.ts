import { SchemaCreator } from '../types';

export interface DateTypeOptions {
  safeMode?: boolean;
  defaultValue?: Date;
}

function isValid(date: Date) {
  return date.getTime() === date.getTime();
}

export const DateType: SchemaCreator<Date | undefined, DateTypeOptions> = (options?: DateTypeOptions) => {
  return (value: any, extraConfig?: any) => toDate(value, { ...extraConfig, ...options});
}

export const toSafeDate = (value: Date, options?: { defaultValue?: Date }) => {
  if(value && isValid(value)) return value;

  return options?.defaultValue || undefined;
}

export const toDate = (value: Date, options?: DateTypeOptions) => {
  if(!options?.safeMode) return value;

  return toSafeDate(value, { defaultValue: options?.defaultValue });
}