// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { Subject } from "../subject";

test("subject is object", () => {
  class DemoSubject<State> extends Subject<State> {}

  const instance = new DemoSubject({
    initialState: { age: 12, address: { city: "HCM" } },
  });

  const proxy = instance.proxyState;

  expect(proxy.age).toEqual(12);
  expect(proxy.address).toEqual({ city: "HCM" });
  expect(proxy.address.city).toEqual("HCM");

  let nextAge: number | undefined = undefined;
  const subscriber1 = (state: typeof proxy) => {
    nextAge = state.age;
  };

  const subscriber2 = (state: typeof proxy) => {
    nextAge = state.age;
  };

  instance.on(subscriber1);

  proxy.age++;

  expect(proxy.age).toEqual(13);
  expect(nextAge).toEqual(13);

  expect(instance.subscriberCount).toEqual(1);
  instance.off(subscriber1);
  expect(instance.subscriberCount).toEqual(0);

  instance.on(subscriber1);
  instance.on(subscriber2);
  expect(instance.subscriberCount).toEqual(2);
  instance.destroy();
  expect(instance.subscriberCount).toEqual(0);
});

test("subject is array", () => {
  class DemoSubject<State> extends Subject<State> {}

  const instance = new DemoSubject({
    initialState: [{ age: 12 }],
  });

  const proxy = instance.proxyState;
  let nextAge: number | undefined = undefined;

  const subscriber = (state: typeof proxy) => {
    nextAge = proxy[0].age;
  };

  instance.on(subscriber);

  expect(proxy[0].age).toEqual(12);

  proxy[0].age++;

  expect(proxy[0].age).toEqual(13);
  expect(nextAge).toEqual(13);
});
