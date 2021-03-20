import { Schema, schemaParser } from '../schema';
import { SchemaType } from '../schema/types';

export interface ModelConfig {
  safeMode?: boolean;
}

const defaultConfig: Partial<ModelConfig> = {
  safeMode: true
}

export class Model<O> {
  private _config: ModelConfig;
  private _schema: Schema<O>;
  constructor(schema: SchemaType<O>, config?: ModelConfig) {
    this._config = Object.assign({}, config || {}, defaultConfig);
    this._schema = new Schema(schema);
  }

  create(dataSource: any) {
    return schemaParser(this._schema, dataSource, this._config);
  }
}