import { isArray, isObject } from "vcc-utils";
import { IObject } from "../@types";

const PRIVATE_STATE = Symbol("PRIVATE_STATE");
const PRIVATE_SUBSCRIBER = Symbol("PRIVATE_SUBSCRIBER");

export interface SubjectConstructProps<State> {
  initialState: State;
}

export type Subscriber<State> = (state: State) => void;

const subjectProxyHandler = <State extends IObject>(
  subjectInstance: Subject<State>
): ProxyHandler<State> => ({
  get: function (target, prop) {
    return Reflect.get(target, prop);
  },

  set: function (target, prop, value) {
    Reflect.set(target, prop, value);
    const subscribers = subjectInstance[PRIVATE_SUBSCRIBER];
    if (subscribers) subscribers.forEach((subscriber) => subscriber(target));
    return true;
  },
});

const implementProxy = <State extends IObject>(
  target: any,
  handler: ProxyHandler<State>
) => {
  return new Proxy(target, handler);
};

export abstract class Subject<State extends IObject | Array<unknown>> {
  public [PRIVATE_STATE]: State;

  public [PRIVATE_SUBSCRIBER]: Set<Subscriber<State>>;

  public proxyState: State;

  constructor(props: SubjectConstructProps<State>) {
    this[PRIVATE_STATE] = props.initialState;
    this[PRIVATE_SUBSCRIBER] = new Set();

    this.proxyState = implementProxy(
      this[PRIVATE_STATE],
      subjectProxyHandler(this)
    );
  }

  on(subscriber: Subscriber<State>) {
    this[PRIVATE_SUBSCRIBER].add(subscriber);
  }

  off(subscriber: Subscriber<State>) {
    this[PRIVATE_SUBSCRIBER].delete(subscriber);
  }

  destroy() {
    this[PRIVATE_SUBSCRIBER].clear();
  }

  get subscriberCount() {
    return this[PRIVATE_SUBSCRIBER].size;
  }
}
