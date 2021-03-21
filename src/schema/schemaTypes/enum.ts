import { SchemaCreator } from '../types';

export interface EnumTypeOptions<E> {
  typeValues: Array<E>;
  defaultValue?: E;
}

// TODO: Re-check Type response
export const Enum = <E,>(options?: EnumTypeOptions<E>): ReturnType<SchemaCreator<E, EnumTypeOptions<E>>> => {
  return (value: any, extraConfig?: any) => toEnum<E>(value, { ...extraConfig, ...options});
}

export const toEnum = <E, >(value: any, options?: EnumTypeOptions<E>) => {
  const typeofValue = typeof value;
  if(typeofValue === "undefined" || typeofValue === "object" || typeofValue === "function") return undefined; 
  
  const unitTypeValues = new Set(options.typeValues);

  if(unitTypeValues.has(value)) {
      return value;
  }

  return undefined;
}