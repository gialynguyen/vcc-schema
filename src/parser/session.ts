import { IObject } from "../../dist";
import { CoreType, TuplesType, ValueType } from "../datatype";
import { ErrorSubject } from "../error";

const ListenersTerm = Symbol("$ON_ALL");
const ErrorListenersTerm = Symbol("$ON_ERROR");
const SuccessListenersTerm = Symbol("$ON_SUCCESS");
const IsSessionUnit = Symbol("$IS_SESSION_UNIT");

type ListenerType =
  | typeof ListenersTerm
  | typeof ErrorListenersTerm
  | typeof SuccessListenersTerm;

type Listener<S> = (result: S) => unknown;

export interface IListener<S> {
  type: ListenerType;
  listener: Listener<S>;
}

interface SessionUnit<R, E> {
  [ListenersTerm]: Set<IListener<{ data?: R; error?: E }>>;
  [ErrorListenersTerm]: Set<IListener<E>>;
  [SuccessListenersTerm]: Set<IListener<R>>;
  [IsSessionUnit]: true;
}

const createSessionUnit = <R, E>(): SessionUnit<R, E> => ({
  [IsSessionUnit]: true,
  [ListenersTerm]: new Set(),
  [ErrorListenersTerm]: new Set(),
  [SuccessListenersTerm]: new Set(),
});

const isSessionUnit = <R, E>(target: any): target is SessionUnit<R, E> => {
  return target?.[IsSessionUnit];
};

const isListenerTerm = (target: any) => 
  target === ListenersTerm ||
  target === ErrorListenersTerm ||
  target === SuccessListenersTerm;

type ErrorRepresentor = {};

type SessionUnitMap<ValueSchemaType> = ValueSchemaType extends any[]
  ? SessionUnitMap<ValueSchemaType[number]>[]
  : ValueSchemaType extends object
  ? {
      [key in keyof ValueSchemaType]: SessionUnitMap<ValueSchemaType[key]>;
    }
  : SessionUnit<ValueSchemaType, ErrorSubject>;

type Selector<SessionMap> = (representor: SessionMap) => any;
type Unsubscribe = () => void;

export class Session<
  SchemaType extends TuplesType<any> | CoreType<any>,
  SessionMap = SessionUnitMap<ValueType<SchemaType>>
> {
  private _representor = createSessionUnit();

  static proxyHandler: ProxyHandler<any> = {
    get: function (target, name) {
      let value = Reflect.get(target, name);

      if (isSessionUnit(target) && isListenerTerm(name)) return value;

      if (!value || !isSessionUnit(value)) {
        value = createSessionUnit();
        Reflect.set(target, name, value);
      }

      return new Proxy(value, Session.proxyHandler);
    },
  };

  private _addListener = (
    selector: Selector<SessionMap>,
    type: ListenerType,
    listener: Listener<any>
  ): Unsubscribe | undefined => {
    const revocable = Proxy.revocable(this._representor, Session.proxyHandler);
    const selected = selector(revocable.proxy);

    if (isSessionUnit(selected)) {
      const listenerObject = {
        type,
        listener,
      } as const;

      const listenerGroup = Reflect.get(selected, type);
      
      listenerGroup.add(listenerObject);

      const unsubscribe = () => {
        listenerGroup.delete(listenerObject);
      };

      revocable.revoke();
      
      return unsubscribe;
    }
  };

  on(selector: Selector<SessionMap>) {
    return null;
  }

  onError(selector: Selector<SessionMap>, listener: Listener<ErrorSubject>) {
    return this._addListener(selector, ErrorListenersTerm, listener);
  }
}
