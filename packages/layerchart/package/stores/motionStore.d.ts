import { spring, tweened } from 'svelte/motion';
export type SpringOptions = Parameters<typeof spring>[1];
export type TweenedOptions = Parameters<typeof tweened>[1];
export type MotionOptions = {
    spring?: boolean | SpringOptions;
    tweened?: boolean | TweenedOptions;
};
export type PropMotionOptions = {
    spring?: boolean | SpringOptions | {
        [prop: string]: SpringOptions;
    };
    tweened?: boolean | TweenedOptions | {
        [prop: string]: TweenedOptions;
    };
};
/**
 * Convenient wrapper to create a motion store (spring(), tweened()) based on properties, or fall back to basic writable() store
 */
export declare function motionStore(value: any, options: MotionOptions): import("svelte/motion").Tweened<unknown> | import("svelte/motion").Spring<any> | import("svelte/store").Writable<any>;
/**
 * Helper to resolve motion options with specific property option (useful for specifying per-prop delays)
 */
export declare function resolveOptions(prop: string, options: PropMotionOptions): {
    spring: any;
    tweened: any;
};
