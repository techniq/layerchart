import { writable } from 'svelte/store';
import { spring, tweened } from 'svelte/motion';

export type SpringOptions = Parameters<typeof spring>[1];
export type TweenedOptions = Parameters<typeof tweened>[1];

export type MotionOptions = {
  spring?: boolean | SpringOptions;
  tweened?: boolean | TweenedOptions;
};

export type PropMotionOptions = {
  spring?: boolean | SpringOptions | { [prop: string]: SpringOptions };
  tweened?: boolean | TweenedOptions | { [prop: string]: TweenedOptions };
};

/**
 * Convenient wrapper to create a motion store (spring(), tweened()) based on properties, or fall back to basic writable() store
 */
export function motionStore<T = any>(value: T, options: MotionOptions) {
  if (options.spring) {
    return spring<T>(value, options.spring === true ? undefined : options.spring);
  } else if (options.tweened) {
    return tweened<T>(value, options.tweened === true ? undefined : options.tweened);
  } else {
    return writable<T>(value);
  }
}

/**
 * Helper to resolve motion options with specific property option (useful for specifying per-prop delays)
 */
export function resolveOptions(prop: string, options: PropMotionOptions) {
  return {
    spring:
      typeof options.spring === 'boolean' || options.spring == null
        ? options.spring
        : prop in options.spring
          ? options.spring[prop]
          : Object.keys(options.spring).some((key) =>
                ['precision', 'damping', 'stiffness'].includes(key)
              )
            ? options.tweened
            : false,
    tweened:
      typeof options.tweened === 'boolean' || options.tweened == null
        ? options.tweened
        : prop in options.tweened
          ? options.tweened[prop]
          : Object.keys(options.tweened).some((key) =>
                ['delay', 'duration', 'easing'].includes(key)
              )
            ? options.tweened
            : false,
  };
}
