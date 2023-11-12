import { writable } from 'svelte/store';
import { spring, tweened } from 'svelte/motion';
/**
 * Convenient wrapper to create a motion store (spring(), tweened()) based on properties, or fall back to basic writable() store
 */
export function motionStore(value, options) {
    if (options.spring) {
        return spring(value, options.spring === true ? undefined : options.spring);
    }
    else if (options.tweened) {
        return tweened(value, options.tweened === true ? undefined : options.tweened);
    }
    else {
        return writable(value);
    }
}
/**
 * Helper to resolve motion options with specific property option (useful for specifying per-prop delays)
 */
export function resolveOptions(prop, options) {
    return {
        spring: typeof options.spring === 'boolean' || options.spring == null
            ? options.spring
            : prop in options.spring
                ? options.spring[prop]
                : options.spring,
        tweened: typeof options.tweened === 'boolean' || options.tweened == null
            ? options.tweened
            : prop in options.tweened
                ? options.tweened[prop]
                : options.tweened
    };
}
