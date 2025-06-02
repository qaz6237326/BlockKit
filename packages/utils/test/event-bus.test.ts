import { EventBus } from "../src/event-bus";

declare module "../src/event-bus" {
  interface EventBusType {
    test: null;
    test2: { a: 1 };
  }
}

describe("event-bus", () => {
  it("on", () => {
    const event = new EventBus();
    const spy = jest.fn();
    const spy2 = jest.fn();
    event.on("test", spy);
    event.on("test", spy);
    event.on("test2", spy2);
    event.emit("test", null);
    event.emit("test2", { a: 1 });
    // @ts-expect-error private
    const len = event.listeners.test?.length;
    expect(len).toEqual(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
  });

  it("once", () => {
    const event = new EventBus();
    const spy = jest.fn();
    event.once("test", spy);
    event.emit("test", null);
    event.emit("test", null);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("off", () => {
    const event = new EventBus();
    const spy = jest.fn();
    event.on("test", spy);
    event.off("test", spy);
    event.emit("test", null);
    expect(spy).toHaveBeenCalledTimes(0);
  });
});
