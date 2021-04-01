import { Model } from '../../models/modelSchema';
import { SchemaCreator, SchemaType } from '../types';

export function ModelType<O extends {
  [key: string]: unknown
}>(modelSchema: Model<O>) {
  return (value: any): { [key in keyof SchemaType<O>]: ReturnType<SchemaType<O>[key]> } | undefined => {
    return value && modelSchema.create(value);
  }
}