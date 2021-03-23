import { SchemaCreator } from '../types';

export interface DateTypeOptions<D = Date> {
  safeMode?: boolean;
  defaultValue?: D;
}

function isValid(date: Date) {
  return date.getTime() === date.getTime();
}

export const DateType = <D = Date,>(options?: DateTypeOptions<D>): ReturnType<SchemaCreator<Date | D, DateTypeOptions<D>>> => {
  return (value: any, extraConfig?: any) => toDate(value, { ...extraConfig, ...options});
}

export const toSafeDate = <D = Date,>(value: any, options?: { defaultValue: D }): Date | D | undefined => {
  if(isValid(value)) return value;

  return options?.defaultValue || undefined;
}

export const toDate = <D = Date,>(value: any, options?: DateTypeOptions<D>) => {
  if (options?.safeMode) {
    return toSafeDate<D>(value, { defaultValue: options?.defaultValue });
  }

  return new Date(value);
}