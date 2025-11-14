import { describe, it, expect } from 'vitest';
import { parseMotionProp, extractTweenConfig } from './motion.svelte.js';
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
