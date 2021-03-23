import { SchemaCreator } from '../types';

export interface EnumTypeOptions<E = unknown> {
  values: Array<E>;
}

export const Enum = <E = unknown>(options?: EnumTypeOptions<E>): ReturnType<SchemaCreator<E, EnumTypeOptions<E>>> => {
  return (value: any, extraConfig?: any) =>  toEnum<E>(value, { ...extraConfig, ...options});
}

export const toEnum = <E, >(value: any, options?: EnumTypeOptions<E>) => {
  const typeofValue = typeof value;
  
  if(typeofValue === "undefined" || (value !== null && typeofValue === "object") || typeofValue === "function") return undefined; 
  
  const unitTypeValues = new Set(options.values);

  if(unitTypeValues.has(value)) return value;

  return undefined;
}