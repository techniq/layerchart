import { writable } from 'svelte/store';
import { spring, tweened } from 'svelte/motion';

/**
 * Convenient wrapper to get motion store based on properties, or fall back to basic writable() store
 */
export function getMotionStore(
	value: any,
	options: {
		spring?: boolean | Parameters<typeof spring>[1];
		tweened?: boolean | Parameters<typeof tweened>[1];
	}
) {
	if (options.spring) {
		return spring(value, options.spring === true ? undefined : options.spring);
	} else if (options.tweened) {
		return tweened(value, options.tweened === true ? undefined : options.tweened);
	} else {
		return writable(value);
	}
}
