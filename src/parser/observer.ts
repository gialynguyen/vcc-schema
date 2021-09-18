import { IObject } from "../@types";
import { CoreType, TuplesType, ValueType } from "../datatype";
import { ErrorSubject } from "../error";

const ListenersTerm = Symbol("$ON_ALL");
const ErrorListenersTerm = Symbol("$ON_ERROR");
const SuccessListenersTerm = Symbol("$ON_SUCCESS");
const IsObserverUnit = Symbol("$IS_OBSERVER_UNIT");

type ListenerType =
  | typeof ListenersTerm
  | typeof ErrorListenersTerm
  | typeof SuccessListenersTerm;

type Listener<S> = (result: S) => unknown;

export interface IListener<S> {
  type: ListenerType;
  listener: Listener<S>;
}

interface ObserverUnit<R, E> {
  [ListenersTerm]: Set<IListener<{ data?: R; error?: E }>>;
  [ErrorListenersTerm]: Set<IListener<E>>;
  [SuccessListenersTerm]: Set<IListener<R>>;
  [IsObserverUnit]: true;
}

type ObserverUnitMap<ValueSchemaType> = ValueSchemaType extends unknown[]
  ? ObserverUnitMap<ObserverUnitMap<ValueSchemaType[number]>>[]
  : ValueSchemaType extends IObject
  ? {
      [key in keyof ValueSchemaType]: ObserverUnitMap<ValueSchemaType[key]>;
    }
  : ValueSchemaType;

type Selector<ObserverMap, T> = (representor: ObserverMap) => T;

type Unsubscribe = () => void;

type GeneralListenerTypeBySelector<
  ObserverMap,
  S extends Selector<ObserverMap, unknown>
> = Listener<{
  data?: ReturnType<S>;
  error?: ErrorSubject;
}>;

const createObserverUnit = <R, E, Map>() =>
  ({
    [IsObserverUnit]: true,
    [ListenersTerm]: new Set(),
    [ErrorListenersTerm]: new Set(),
    [SuccessListenersTerm]: new Set(),
  } as ObserverUnit<R, E> & Map);

const isObserverUnit = <R, E>(target: any): target is ObserverUnit<R, E> => {
  return target?.[IsObserverUnit];
};

const isListenerTerm = (target: unknown) =>
  target === ListenersTerm ||
  target === ErrorListenersTerm ||
  target === SuccessListenersTerm;

export class Observer<
  SchemaType extends TuplesType<any> | CoreType<any>,
  ObserverMap = ObserverUnitMap<ValueType<SchemaType>>
> {
  private _representor = createObserverUnit<
    ObserverMap,
    ErrorSubject,
    ObserverMap
  >();

  static proxyHandler: ProxyHandler<any> = {
    get: function (target, name) {
      let value = Reflect.get(target, name);

      if (isObserverUnit(target) && isListenerTerm(name)) return value;

      if (!value || !isObserverUnit(value)) {
        value = createObserverUnit();
        Reflect.set(target, name, value);
      }

      return new Proxy(value, Observer.proxyHandler);
    },
  };

  private _addListener = <T, R>(
    selector: Selector<ObserverMap, T>,
    type: ListenerType,
    listener: Listener<R>
  ): Unsubscribe | undefined => {
    const revocable = Proxy.revocable(this._representor, Observer.proxyHandler);
    const selected = selector(revocable.proxy);

    if (isObserverUnit(selected)) {
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

  on<T>(
    selector: Selector<ObserverMap, T>,
    listener: GeneralListenerTypeBySelector<ObserverMap, typeof selector>
  ) {
    return this._addListener(selector, ListenersTerm, listener);
  }

  onError<T>(
    selector: Selector<ObserverMap, T>,
    listener: Listener<ErrorSubject>
  ) {
    return this._addListener(selector, ErrorListenersTerm, listener);
  }

  onSuccess<T>(selector: Selector<ObserverMap, T>, listener: Listener<T>) {
    return this._addListener(selector, SuccessListenersTerm, listener);
  }

  get representor() {
    return Object.freeze(this._representor);
  }

  dispatchByPath<T>(params: {
    path: (string | number)[];
    type: "error" | "succuss";
    payload: T;
  }) {
    const { path, type, payload } = params;

    let observerUnit: ObserverUnit<any, ErrorSubject> = this.representor;
    let needDispatch = true;

    for (let index = 0; index < path.length; index++) {
      const currentPath = path[index];
      const currentObserver = Reflect.get(observerUnit, currentPath);
      if (!currentObserver) {
        needDispatch = false;
        break;
      } else {
        observerUnit = currentObserver;
      }
    }
  }
}
