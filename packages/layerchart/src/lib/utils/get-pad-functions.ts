import type { AnyScale } from './scales.js';

// Define possible scale types
type ScaleType = 'log' | 'symlog' | 'pow' | 'sqrt' | 'other';

export function identity<T>(d: T): T {
  return d;
}

type ScaleWithProps = AnyScale & {
  constant?: number;
  base?: () => number;
  exponent?: () => number;
  domain: () => number[];
};

export function findScaleType(scale: ScaleWithProps): ScaleType {
  if (typeof scale.constant === 'number') {
    return 'symlog';
  }
  if (typeof scale.base === 'function') {
    return 'log';
  }
  if (typeof scale.exponent === 'function') {
    const expValue = scale.exponent();
    if (expValue === 0.5) {
      return 'sqrt';
    }
    return 'pow';
  }
  return 'other';
}

// Type for transformation functions
interface TransformFunctions {
  lift: (x: number) => number;
  ground: (x: number) => number;
  scaleType: ScaleType;
}

// Helper functions with explicit types
function log(sign: number): (x: number) => number {
  return (x: number): number => Math.log(sign * x);
}

function exp(sign: number): (x: number) => number {
  return (x: number): number => sign * Math.exp(x);
}

function symlog(c: number): (x: number) => number {
  return (x: number): number => Math.sign(x) * Math.log1p(Math.abs(x / c));
}

function symexp(c: number): (x: number) => number {
  return (x: number): number => Math.sign(x) * Math.expm1(Math.abs(x)) * c;
}

function pow(exponent: number): (x: number) => number {
  return function powFn(x: number): number {
    return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
  };
}

// Main function with proper typing
export function getPadFunctions(scale: ScaleWithProps): TransformFunctions {
  const scaleType = findScaleType(scale);

  switch (scaleType) {
    case 'log': {
      const domain = scale.domain();
      const sign = Math.sign(domain[0] || 1); // Default to 1 if domain[0] is 0
      return { lift: log(sign), ground: exp(sign), scaleType };
    }
    case 'pow': {
      const exponent = scale.exponent ? scale.exponent() : 1;
      return {
        lift: pow(exponent),
        ground: pow(1 / exponent),
        scaleType,
      };
    }
    case 'sqrt': {
      const exponent = 0.5;
      return {
        lift: pow(exponent),
        ground: pow(1 / exponent),
        scaleType,
      };
    }
    case 'symlog': {
      const constant = typeof scale.constant === 'number' ? scale.constant : 1;
      return {
        lift: symlog(constant),
        ground: symexp(constant),
        scaleType,
      };
    }
    default:
      return {
        lift: identity<number>,
        ground: identity<number>,
        scaleType,
      };
  }
}
