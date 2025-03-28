import { Spring, Tween } from 'svelte/motion';
import { afterTick } from './afterTick.js';

/**
 * Spring motion configuration options
 */
export type SpringOptions<T = any> = ConstructorParameters<typeof Spring<T>>[1];
export type SpringSetOptions = Parameters<(typeof Spring)['prototype']['set']>[1];

/**
 * Tween motion configuration options
 */
export type TweenOptions<T = any> = ConstructorParameters<typeof Tween<T>>[1];
export type TweenSetOptions = Parameters<(typeof Tween)['prototype']['set']>[1];

/**
 * MotionNone is a non-animating state container that provides a compatible
 * interface with Spring and Tween, but updates values immediately without animation.
 * This gives us consistent state management whether animations are enabled or not.
 */
export type NoneOptions<T = any> = ConstructorParameters<typeof MotionNone<T>>[1];
export type NoneSetOptions = Parameters<(typeof MotionNone)['prototype']['set']>[1];

/**
 * Configuration object for Spring animations with additional type discriminator
 */
export type MotionSpringOption =
  | ({
      type: 'spring';
    } & SpringOptions)
  | 'spring';

/**
 * Configuration object for Tween animations with additional type discriminator
 */
export type MotionTweenOption =
  | ({
      type: 'tween';
    } & TweenOptions)
  | 'tween';

/**
 * Configuration object for non-animating state with additional type discriminator
 */
export type MotionNoneOption =
  | {
      type: 'none';
    }
  | 'none';

/**
 * Union type of all possible motion configuration options
 */
export type MotionOptions = MotionSpringOption | MotionTweenOption | MotionNoneOption;

/**
 * Motion config that can be either a direct motion config or
 * a map of property names to motion configs
 */
type IsDefault<K> = K extends string ? (string extends K ? true : false) : never;

export type MotionProp<K extends string = string> =
  IsDefault<K> extends true ? MotionOptions : MotionOptions | { [prop in K]?: MotionOptions };

/**
 * Extended Spring class that adds a type discriminator to help with
 * type narrowing in our motion system
 */
class MotionSpring<T = any> extends Spring<T> {
  type = 'spring' as const;
  constructor(value: T, options?: SpringOptions<T>) {
    super(value, options);
  }
}

/**
 * Extended Tween class that adds a type discriminator to help with
 * type narrowing in our motion system
 */
class MotionTween<T = any> extends Tween<T> {
  type = 'tween' as const;
  constructor(value: T, options?: TweenOptions<T>) {
    super(value, options);
  }
}

/**
 * MotionNone is a state container that provides the same interface as
 * Spring and Tween but without any animation logic. Values update immediately.
 *
 * This allows components to use a consistent API regardless of whether
 * animations are enabled or not.
 */
class MotionNone<T = any> {
  type = 'none' as const;
  #current = $state<T>(null!);
  #target = $state<T>(null!);

  constructor(value: T, _options: any = {}) {
    this.#current = value;
    this.#target = value;
  }

  /**
   * Updates the value immediately and returns a resolved promise
   * to maintain API compatibility with animated motion classes
   */
  set(value: T, _options: any = {}): Promise<void> {
    this.#current = value;
    this.#target = value;
    return Promise.resolve();
  }

  get current() {
    return this.#current;
  }

  get target() {
    return this.#target;
  }

  set target(v: T) {
    this.set(v);
  }
}

type ResolvedTween = { type: 'tween'; options: TweenOptions };
type ResolvedSpring = { type: 'spring'; options: SpringOptions };
type ResolvedNone = { type: 'none'; options: {} };

/**
 * Union type of all possible resolved motion configurations
 */
export type ResolvedMotion = ResolvedSpring | ResolvedTween | ResolvedNone;

/**
 * Internal options for motion state configuration
 */
type InternalMotionOptions = {
  /**
   * When true, the motion state will only update when explicitly set
   * rather than automatically tracking changes to the source value
   */
  controlled?: boolean;

  /**
   * When true, the tracked motion state will wait a tick before updating
   * to allow for any other state changes to occur first.
   */
  afterTick?: boolean;
};

/**
 * Union type of all possible motion state containers
 */
type MotionState<T> = MotionSpring<T> | MotionTween<T> | MotionNone<T>;

/**
 * Sets up automatic tracking between a source value and a motion state
 * when the motion is in controlled mode
 */
function setupTracking<T>(
  motion: MotionState<T>,
  getValue: () => T,
  options: InternalMotionOptions
) {
  if (options.controlled) return;
  if (options.afterTick) {
    $effect(() => {
      afterTick(() => {
        motion.set(getValue());
      });
    });
  } else {
    $effect(() => {
      motion.set(getValue());
    });
  }
}

export function createMotion<T = any>(
  initialValue: T,
  getValue: () => T,
  motionProp: MotionOptions | undefined,
  options: InternalMotionOptions = {}
) {
  const motion = parseMotionProp(motionProp);
  if (motion === undefined) {
    const fallback = new MotionNone<T>(initialValue);
    setupTracking(fallback, getValue, options);
    return fallback;
  }

  if (motion.type === 'spring') {
    const spring = new MotionSpring(initialValue, motion.options);
    setupTracking(spring, getValue, options);
    return spring;
  }
  const tween = new MotionTween(initialValue, motion.options);
  setupTracking(tween, getValue, options);
  return tween;
}

/**
 * Creates a controlled motion state that only updates when explicitly set
 * rather than automatically tracking changes to the source value
 */
export function createControlledMotion<T = any>(
  initialValue: T,
  motionProp: MotionOptions | undefined
) {
  return createMotion<T>(initialValue, () => initialValue, motionProp, { controlled: true });
}

/**
 * Creates a state tracker for animation completion
 * This helps track whether any motion transitions are currently in progress
 *
 * @returns an object with methods to handle animation promises and check current status
 */
export function createMotionTracker() {
  let latestIndex = 0;
  let current = $state(false);

  function handle(promise: Promise<void> | void) {
    latestIndex += 1;
    if (!promise) {
      current = false;
      return;
    }
    let currIndex = latestIndex;
    current = true;
    promise
      .then(() => {
        if (currIndex === latestIndex) {
          current = false;
        }
      })
      .catch(() => {});
  }

  return {
    handle,
    get current() {
      return current;
    },
  };
}

/**
 * Extracts tween configuration from a motion prop
 * @returns Resolved tween configuration or undefined if not a tween
 */
export function extractTweenConfig<T extends string = never>(
  prop?: MotionProp<T> | undefined
): ResolvedTween | undefined {
  const resolved = parseMotionProp(prop);
  if (resolved.type === 'tween') return resolved;
}

/**
 * Parses and normalizes a motion configuration into a standard format
 *
 * @param config - The motion configuration to parse
 * @param propertyKey - Optional property key when config is a map of properties
 * @returns A standardized motion configuration object
 */
export function parseMotionProp<T extends string = never>(
  config: MotionProp<T> | undefined,
  accessor?: string
): ResolvedMotion {
  // Default to no animation if no configuration provided
  if (config === undefined) return { type: 'none', options: {} };

  // Case 1: string shorthand ('spring', 'tween', 'none')
  if (typeof config === 'string') {
    if (config === 'spring') {
      return { type: 'spring', options: {} };
    } else if (config === 'tween') {
      return { type: 'tween', options: {} };
    }
    return { type: 'none', options: {} };
  }

  // Case 2: Object with explicit type property
  if (typeof config === 'object' && 'type' in config) {
    if (config.type === 'spring') {
      const { type, ...options } = config;
      return { type: 'spring', options };
    } else if (config.type === 'tween') {
      const { type, ...options } = config;
      return { type: 'tween', options };
    } else {
      return { type: 'none', options: {} };
    }
  }

  // Case 3: Property map object, lookup by property key
  // We've already established config is an object at this point
  if (accessor) {
    const propConfig = config[accessor as keyof typeof config];
    if (propConfig !== undefined) {
      return parseMotionProp(propConfig as MotionProp<never>);
    }
  }

  // Fallback to no animation
  return {
    type: 'none',
    options: {},
  };
}
