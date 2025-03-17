import { Spring, Tween } from 'svelte/motion';

type ConstructorParameters<T> = T extends new (...args: infer P) => any ? P : never;

export type SpringOptions<T = any> = ConstructorParameters<typeof Spring<T>>[1];
export type TweenedOptions<T = any> = ConstructorParameters<typeof Tween<T>>[1];

export type SpringProp<T = any> = boolean | SpringOptions<T>;
export type TweenedProp<T = any> = boolean | TweenedOptions<T>;

export type MotionProps<T = any> = {
  /**
   * Tweened options for the motion state.
   *
   * - `true` - default spring options will be used
   * - `false` - no spring animation will be applied
   * - `SpringOptions` - spring options for the motion state
   */
  spring?: SpringProp<T> | { [prop: string]: SpringProp<T> } | boolean;

  /**
   * Tweened options for the motion state.
   *
   * - `true` - default tweened options will be used
   * - `false` - no tween animation will be applied
   * - `TweenedOptions` - tween options for the motion state
   */
  tweened?: TweenedProp<T> | { [prop: string]: TweenedProp<T> } | boolean;
};

export type PropMotionOptions<T = any> = {
  spring?: boolean | SpringOptions<T> | { [prop: string]: SpringOptions<T> };
  tweened?: boolean | TweenedOptions<T> | { [prop: string]: TweenedOptions<T> };
};

export interface MotionState<T> {
  set(newValue: T, options?: MotionProps<T>): Promise<void>;
  get current(): T;
  set target(v: T);
}

/**
 * Convenient wrapper to create a motion store (spring(), tweened()) based on properties,
 * or fallback to basic writable state.
 */
export function motionState<T = any>(
  value: T,
  options: MotionProps<T>
): Spring<T> | Tween<T> | MotionState<T> {
  if (options.spring) {
    return new Spring<T>(value, options.spring === true ? undefined : options.spring) as Spring<T>;
  } else if (options.tweened) {
    return new Tween<T>(value, options.tweened === true ? undefined : options.tweened) as Tween<T>;
  } else {
    let current: T = $state(value);
    return {
      set(newValue: T, _options?: MotionProps<T>) {
        current = newValue;
      },
      get current(): T {
        return current;
      },
      set target(v: T) {
        current = v;
      },
    };
  }
}

export class MotionFinishState {
  #latestIndex = 0;
  #current = $state(false);

  handle = (promise: Promise<void> | void) => {
    this.#latestIndex += 1;
    if (!promise) {
      this.#current = false;
      return;
    }
    let currIndex = this.#latestIndex;
    this.#current = true;
    promise.then(() => {
      if (currIndex === this.#latestIndex) {
        this.#current = false;
      }
    });
  };

  get current() {
    return this.#current;
  }
}

/**
 * Helper to resolve motion options with specific property option
 * (useful for specifying per-prop delays)
 */
export function resolveOptions(prop: string, options: PropMotionOptions<any>) {
  return {
    spring:
      typeof options.spring === 'boolean' || options.spring == null
        ? options.spring
        : prop in options.spring
          ? //@ts-expect-error
            options.spring[prop]
          : Object.keys(options.spring).some((key) =>
                ['precision', 'damping', 'stiffness'].includes(key)
              )
            ? options.tweened
            : false,
    tweened:
      typeof options.tweened === 'boolean' || options.tweened == null
        ? options.tweened
        : prop in options.tweened
          ? //@ts-expect-error
            options.tweened[prop]
          : Object.keys(options.tweened).some((key) =>
                ['delay', 'duration', 'easing'].includes(key)
              )
            ? options.tweened
            : false,
  };
}
