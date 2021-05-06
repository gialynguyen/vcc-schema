import { Types } from "../datatype";

export type IDefaultValueByType = Partial<Record<Types, any>>;

const defaultValueByType: IDefaultValueByType = {};

export const configDefaultValueByType = (config: IDefaultValueByType) => {
  return Object.freeze(Object.assign(defaultValueByType, config));
};

export const getTypesDefaultValue = () => Object.freeze(defaultValueByType);

export const getDefaultValueByType = (type: Types) =>
  Object.freeze(defaultValueByType[type]);
