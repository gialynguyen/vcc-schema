import { isFunction } from 'vcc-utils';
import { ICallback } from '../@types';
import { CoreType, Types } from './base';

import {
  ErrorConstructorMessage,
  InvalidTypeError,
  InvalidTypeErrorPayload,
} from '../error';
import { typeOf } from '../utils/type';

export class FuncType<
  RType = void,
  AType extends any[] = [],
  BType extends ICallback<RType, AType> = ICallback<RType, AType>
> extends CoreType<BType> {
  static create = <RType = void, AType extends any[] = []>(
    error?: ErrorConstructorMessage<InvalidTypeErrorPayload>
  ) => {
    return new FuncType<RType, AType, ICallback<RType, AType>>({
      type: Types.func,
      defaultCheckers: [
        (value: any, { ctx: { paths } }) => {
          const valid = isFunction(value);
          if (valid) return value;

          return new InvalidTypeError({
            expectedType: Types.func,
            receivedType: typeOf(value),
            message: error,
            paths,
            prerequisite: true,
            inputData: value,
          });
        },
      ],
    });
  };
}

export const func = FuncType.create;
