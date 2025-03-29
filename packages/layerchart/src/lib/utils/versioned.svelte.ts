type Getter<T> = () => T;

type MaybeGetter<T> = Getter<T> | T;

export class Versioned<T> {
  #data: T;
  #version = $state(0);

  constructor(data: T) {
    this.#data = data;
  }

  get current() {
    this.#version;
    return this.#data;
  }
  set current(_data) {
    this.#version++;
    this.#data = _data;
  }
  invalidate() {
    this.#version++;
  }
}

export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

export function extract<T>(value: MaybeGetter<T>, defaultValue?: T): T {
  if (isFunction(value)) {
    const getter = value as Getter<T>;
    return getter() ?? defaultValue ?? getter();
  }

  return value ?? defaultValue ?? value;
}
