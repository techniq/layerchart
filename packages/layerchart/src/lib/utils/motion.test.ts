import { describe, it, expect } from 'vitest';
import { createMotion, parseMotionProp, extractTweenConfig } from './motion.svelte.js';
import type {
  MotionProp,
  MotionSpringOption,
  MotionTweenOption,
  MotionNoneOption,
  ResolvedMotion,
} from './motion.svelte.js';

describe('parseMotionProp', () => {
  it('should return "none" type when config is undefined', () => {
    const result = parseMotionProp(undefined);
    expect(result).toEqual({ type: 'none', options: {} });
  });

  it('should return an already resolved motion object that may have been parsed earlier in the chain', () => {
    const resolvedMotion: ResolvedMotion = {
      type: 'spring',
      options: {
        stiffness: 0.5,
        damping: 0.8,
      },
    };
    const result = parseMotionProp(resolvedMotion);
    expect(result).toEqual(resolvedMotion);
  });

  describe('string input handling', () => {
    it('should handle "spring" string shorthand', () => {
      const result = parseMotionProp('spring');
      expect(result).toEqual({ type: 'spring', options: {} });
    });

    it('should handle "tween" string shorthand', () => {
      const result = parseMotionProp('tween');
      expect(result).toEqual({ type: 'tween', options: {} });
    });

    it('should handle "none" string shorthand', () => {
      const result = parseMotionProp('none');
      expect(result).toEqual({ type: 'none', options: {} });
    });

    it('should default to "none" for invalid string values', () => {
      const result = parseMotionProp('invalid' as any);
      expect(result).toEqual({ type: 'none', options: {} });
    });
  });

  describe('object with type property', () => {
    it('should handle spring object with options', () => {
      const springConfig: MotionSpringOption = {
        type: 'spring',
        stiffness: 0.5,
        damping: 0.8,
      };
      const result = parseMotionProp(springConfig);
      expect(result).toEqual({
        type: 'spring',
        options: { stiffness: 0.5, damping: 0.8 },
      });
    });

    it('should handle tween object with options', () => {
      const tweenConfig: MotionTweenOption = {
        type: 'tween',
        duration: 300,
        easing: (t) => t,
      };
      const result = parseMotionProp(tweenConfig);
      expect(result).toEqual({
        type: 'tween',
        options: { duration: 300, easing: expect.any(Function) },
      });
    });

    it('should handle none object', () => {
      const noneConfig: MotionNoneOption = {
        type: 'none',
      };
      const result = parseMotionProp(noneConfig);
      expect(result).toEqual({ type: 'none', options: {} });
    });
  });

  describe('property map object with accessor', () => {
    it('should extract a specific property motion config', () => {
      const propMap: MotionProp<'x' | 'y' | 'scale'> = {
        x: 'spring',
        y: { type: 'tween', duration: 300 },
        scale: { type: 'spring', stiffness: 0.2 },
      };

      const resultX = parseMotionProp(propMap, 'x');
      expect(resultX).toEqual({ type: 'spring', options: {} });

      const resultY = parseMotionProp(propMap, 'y');
      expect(resultY).toEqual({ type: 'tween', options: { duration: 300 } });

      const resultScale = parseMotionProp(propMap, 'scale');
      expect(resultScale).toEqual({ type: 'spring', options: { stiffness: 0.2 } });
    });

    it('should return "none" type for non-existent accessor', () => {
      const propMap: MotionProp<'x' | 'y'> = {
        x: 'spring',
        y: 'tween',
      };

      const result = parseMotionProp(propMap, 'z');
      expect(result).toEqual({ type: 'none', options: {} });
    });
  });

  describe('edge cases', () => {
    it('should handle empty object as "none"', () => {
      const result = parseMotionProp({} as any);
      expect(result).toEqual({ type: 'none', options: {} });
    });

    it('should handle object without type property', () => {
      const invalidObject = {
        stiffness: 0.5,
        damping: 0.8,
      } as any;

      const result = parseMotionProp(invalidObject);
      expect(result).toEqual({ type: 'none', options: {} });
    });
  });

  // Test case 6: Type Generic
  describe('type generic parameter', () => {
    it('should work with explicit generic type parameter', () => {
      type ValidProps = 'x' | 'y' | 'scale';
      const propMap: MotionProp<ValidProps> = {
        x: 'spring',
        y: 'tween',
        scale: { type: 'spring', stiffness: 0.3 },
      };

      const result = parseMotionProp<ValidProps>(propMap, 'x');
      expect(result).toEqual({ type: 'spring', options: {} });
    });
  });
});

describe('createMotion', () => {
  describe('fast path (motionProp === undefined)', () => {
    it('should return a passthrough that reads from the getter', () => {
      let value = 42;
      const motion = createMotion(0, () => value, undefined);
      expect(motion.current).toBe(42);

      value = 99;
      expect(motion.current).toBe(99);
    });

    it('should have type "none"', () => {
      const motion = createMotion(0, () => 0, undefined);
      expect(motion.type).toBe('none');
    });

    it('should return resolved promise from set()', async () => {
      const motion = createMotion(0, () => 0, undefined);
      const result = motion.set(10);
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBeUndefined();
    });

    it('target getter should read from getValue', () => {
      let value = 5;
      const motion = createMotion(0, () => value, undefined);
      expect(motion.target).toBe(5);

      value = 20;
      expect(motion.target).toBe(20);
    });
  });

  describe('with explicit "none" motion', () => {
    it('should create a MotionNone state (not a passthrough)', () => {
      const motion = createMotion(0, () => 42, 'none');
      // MotionNone stores its own state, so current reflects the initial value
      // until the tracking effect runs (which requires Svelte runtime)
      expect(motion.type).toBe('none');
    });
  });

  describe('with spring motion', () => {
    it('should create a spring motion state', () => {
      const motion = createMotion(0, () => 42, 'spring');
      expect(motion.type).toBe('spring');
    });
  });

  describe('with tween motion', () => {
    it('should create a tween motion state', () => {
      const motion = createMotion(0, () => 42, 'tween');
      expect(motion.type).toBe('tween');
    });
  });
});

describe('extractTweenConfig', () => {
  // Test case 1: Undefined input
  it('should return undefined when config is undefined', () => {
    const result = extractTweenConfig(undefined);
    expect(result).toBeUndefined();
  });

  // Test case 2: String inputs
  describe('string input handling', () => {
    it('should extract tween config from "tween" string shorthand', () => {
      const result = extractTweenConfig('tween');
      expect(result).toEqual({ type: 'tween', options: {} });
    });

    it('should return undefined for "spring" string shorthand', () => {
      const result = extractTweenConfig('spring');
      expect(result).toBeUndefined();
    });

    it('should return undefined for "none" string shorthand', () => {
      const result = extractTweenConfig('none');
      expect(result).toBeUndefined();
    });
  });

  // Test case 3: Object with type property
  describe('object with type property', () => {
    it('should extract tween object with options', () => {
      const tweenConfig: MotionTweenOption = {
        type: 'tween',
        duration: 300,
        easing: (t) => t,
      };
      const result = extractTweenConfig(tweenConfig);
      expect(result).toEqual({
        type: 'tween',
        options: { duration: 300, easing: expect.any(Function) },
      });
    });

    it('should return undefined for spring object', () => {
      const springConfig: MotionProp = {
        type: 'spring',
        stiffness: 0.5,
        damping: 0.8,
      };
      const result = extractTweenConfig(springConfig);
      expect(result).toBeUndefined();
    });

    it('should return undefined for none object', () => {
      const noneConfig: MotionProp = {
        type: 'none',
      };
      const result = extractTweenConfig(noneConfig);
      expect(result).toBeUndefined();
    });
  });

  // Test case 4: Property map object (without accessor)
  describe('property map object without accessor', () => {
    it('should return undefined for property map objects without accessor', () => {
      const propMap: MotionProp<'x' | 'y' | 'scale'> = {
        x: 'tween',
        y: { type: 'tween', duration: 300 },
        scale: { type: 'spring', stiffness: 0.2 },
      };

      const result = extractTweenConfig(propMap);
      expect(result).toBeUndefined();
    });
  });

  // Test case 6: Edge cases
  describe('edge cases', () => {
    it('should handle empty object', () => {
      const result = extractTweenConfig({} as any);
      expect(result).toBeUndefined();
    });

    it('should handle object without type property', () => {
      const invalidObject = {
        duration: 300,
        easing: (t: any) => t,
      } as any;

      const result = extractTweenConfig(invalidObject);
      expect(result).toBeUndefined();
    });
  });

  describe('with generic type parameter', () => {
    it('should work with explicit generic type parameter', () => {
      const propMap: MotionProp<'x' | 'y' | 'scale'> = {
        x: 'tween',
        y: { type: 'tween', duration: 400 },
        scale: 'spring',
      };

      // The extractTweenConfig function doesn't directly support accessors,
      // so for this case we manually extract the property first
      const xConfig = propMap.x;
      const result = extractTweenConfig(xConfig);
      expect(result).toEqual({ type: 'tween', options: {} });
    });
  });
});
