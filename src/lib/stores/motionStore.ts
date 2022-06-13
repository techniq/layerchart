import { writable } from 'svelte/store';
import { spring, tweened } from 'svelte/motion';

export type MotionOptions = {
	spring?: boolean | Parameters<typeof spring>[1];
	tweened?: boolean | Parameters<typeof tweened>[1];
};

/**
 * Convenient wrapper to create a motion store (spring(), tweened()) based on properties, or fall back to basic writable() store
 */
export function motionStore(value: any, options: MotionOptions) {
	if (options.spring) {
		return spring(value, options.spring === true ? undefined : options.spring);
	} else if (options.tweened) {
		return tweened(value, options.tweened === true ? undefined : options.tweened);
	} else {
		return writable(value);
	}
}
