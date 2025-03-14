import { arraysEqual } from './array.js';
import { toTitleCase } from './string.js';

function f(name: string, modifier = '') {
  return `scale${toTitleCase(modifier)}${toTitleCase(name)}`;
}

/**
 * Get a D3 scale name
 * https://svelte.dev/repl/ec6491055208401ca41120c9c8a67737?version=3.49.0
 */
export default function findScaleName(scale: any) {
  /**
   * Ordinal scales
   */
  // scaleBand, scalePoint
  // @ts-ignore
  if (typeof scale.bandwidth === 'function') {
    // @ts-ignore
    if (typeof scale.paddingInner === 'function') {
      return f('band');
    }
    return f('point');
  }
  // scaleOrdinal
  if (arraysEqual(Object.keys(scale), ['domain', 'range', 'unknown', 'copy'])) {
    return f('ordinal');
  }

  /**
   * Sequential versus diverging
   */
  let modifier = '';
  // @ts-ignore
  if (scale.interpolator) {
    // @ts-ignore
    if (scale.domain().length === 3) {
      modifier = 'diverging';
    } else {
      modifier = 'sequential';
    }
  }

  /**
   * Continuous scales
   */
  // @ts-ignore
  if (scale.quantiles) {
    return f('quantile', modifier);
  }
  // @ts-ignore
  if (scale.thresholds) {
    return f('quantize', modifier);
  }
  // @ts-ignore
  if (scale.constant) {
    return f('symlog', modifier);
  }
  // @ts-ignore
  if (scale.base) {
    return f('log', modifier);
  }
  // @ts-ignore
  if (scale.exponent) {
    // @ts-ignore
    if (scale.exponent() === 0.5) {
      return f('sqrt', modifier);
    }
    return f('pow', modifier);
  }

  if (arraysEqual(Object.keys(scale), ['domain', 'range', 'invertExtent', 'unknown', 'copy'])) {
    return f('threshold');
  }

  if (
    arraysEqual(Object.keys(scale), [
      'invert',
      'range',
      'domain',
      'unknown',
      'copy',
      'ticks',
      'tickFormat',
      'nice',
    ])
  ) {
    return f('identity');
  }

  if (
    arraysEqual(Object.keys(scale), [
      'invert',
      'domain',
      'range',
      'rangeRound',
      'round',
      'clamp',
      'unknown',
      'copy',
      'ticks',
      'tickFormat',
      'nice',
    ])
  ) {
    return f('radial');
  }

  if (modifier) {
    return f(modifier);
  }

  /**
   * Test for scaleTime vs scaleUtc
   * https://github.com/d3/d3-scale/pull/274#issuecomment-1462935595
   */
  if (scale.domain()[0] instanceof Date) {
    const d = new Date();
    let s: string = '';
    // @ts-ignore
    d.getDay = () => (s = 'time');
    // @ts-ignore
    d.getUTCDay = () => (s = 'utc');

    scale.tickFormat(0, '%a')(d);
    return f(s);
  }

  return f('linear');
}
