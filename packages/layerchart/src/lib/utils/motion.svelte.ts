import { untrack } from 'svelte';
import { Spring, Tween } from 'svelte/motion';

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

type IsDefault<K> = K extends string ? (string extends K ? true : false) : never;

/**
 * Motion config that can be either a direct motion config or
 * a map of property names to motion configs
 */
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

export type ResolvedTween = { type: 'tween'; options: TweenOptions };
export type ResolvedSpring = { type: 'spring'; options: SpringOptions };
export type ResolvedNone = { type: 'none'; options: {} };

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
};

/**
 * Union type of all possible motion state containers
 */
type MotionState<T> = MotionSpring<T> | MotionTween<T> | MotionNone<T>;

/**
 * Sets up automatic tracking between a source value and a motion state.
 * When the `controlled` option is `true`, the motion state will not update
 * automatically and will only update when explicitly set.
 */
function setupTracking<T>(
  motion: MotionState<T>,
  getValue: () => T,
  options: InternalMotionOptions
) {
  if (options.controlled) return;

  $effect(() => {
    const value = getValue();
    if (value == null) return;
    // Use untrack to prevent reactive reads inside motion.set() and motion.target
    // from being tracked as dependencies of this effect (which would cause infinite loops)
    untrack(() => {
      motion.set(value, { instant: motion.target == null });
    });
  });
}

export function createMotion<T = any>(
  initialValue: T,
  getValue: () => T,
  motionProp: MotionOptions | undefined,
  options: InternalMotionOptions = {}
) {
  // Fast path: when no motion is configured, skip all state/effect overhead
  // and return a lightweight passthrough that reads directly from the getter.
  if (motionProp === undefined) {
    return {
      type: 'none' as const,
      get current() {
        return getValue();
      },
      get target() {
        return getValue();
      },
      set target(v: T) {
        // no-op for passthrough
      },
      set(_value: T, _options?: any): Promise<void> {
        return Promise.resolve();
      },
    };
  }

  const motion = parseMotionProp(motionProp);
  const motionState =
    motion.type === 'spring'
      ? new MotionSpring(initialValue, motion.options)
      : motion.type === 'tween'
        ? new MotionTween(initialValue, motion.options)
        : new MotionNone<T>(initialValue);
  setupTracking(motionState, getValue, options);
  return motionState;
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
 * Creates a motion state map for data mode rendering.
 * Tracks per-item animated values keyed by the item key.
 * Returns null if no motion is configured (type: 'none').
 */
export function createDataMotionMap(motionProp: MotionOptions | undefined) {
  // Fast path: skip parseMotionProp overhead when no motion is configured
  if (motionProp === undefined) return null;
  const config = parseMotionProp(motionProp);
  if (config.type === 'none') return null;

  const map = new Map<any, Map<string, MotionSpring<number> | MotionTween<number>>>();

  function create(value: number): MotionSpring<number> | MotionTween<number> {
    return config.type === 'spring'
      ? new MotionSpring(value, config.options as SpringOptions)
      : new MotionTween(value, config.options as TweenOptions);
  }

  return {
    /** Update motion targets for an item. Creates states on first call per key/prop. */
    update(key: any, values: Record<string, number>) {
      let itemMap = map.get(key);
      if (!itemMap) {
        itemMap = new Map();
        map.set(key, itemMap);
      }
      for (const [prop, value] of Object.entries(values)) {
        let state = itemMap.get(prop);
        if (!state) {
          state = create(value);
          itemMap.set(prop, state);
        } else {
          state.set(value);
        }
      }
    },
    /** Get current animated values for an item, or null if not tracked yet. */
    get(key: any): Record<string, number> | null {
      const itemMap = map.get(key);
      if (!itemMap) return null;
      const result: Record<string, number> = {};
      for (const [prop, state] of itemMap) {
        result[prop] = state.current;
      }
      return result;
    },
    /** Remove items no longer in the active set. */
    cleanup(activeKeys: Set<any>) {
      for (const key of map.keys()) {
        if (!activeKeys.has(key)) map.delete(key);
      }
    },
  };
}

export type DataMotionMap = NonNullable<ReturnType<typeof createDataMotionMap>>;

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
  config: MotionProp<T> | undefined | ResolvedMotion,
  accessor?: string
): ResolvedMotion {
  if (typeof config === 'object' && 'type' in config && 'options' in config) {
    if (typeof config.options === 'object') return config;
    return { type: config.type, options: {} };
  }
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
