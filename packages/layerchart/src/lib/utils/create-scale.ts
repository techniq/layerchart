import { getDefaultRange } from './get-default-range.js';
import padScale from './pad-scale.js';
import type { AnyScale } from './scales.js';
import type { AxisKey, BaseRange, Extents, Nice, Padding, PaddingArray } from './types.js';

type CreateScaleOpts = {
  domain: number[];
  extents: Extents;
  scale: AnyScale & {
    interpolator?: () => { name: string };
    nice?: (nice?: number) => void;
  };
  padding: PaddingArray | undefined;
  nice: Nice;
  reverse: boolean;
  width: number;
  height: number;
  range: BaseRange | undefined;
  percentRange: boolean;
};

export function createScale(
  axis: AxisKey,
  {
    domain,
    extents,
    scale,
    padding,
    nice,
    reverse,
    width,
    height,
    range,
    percentRange,
  }: CreateScaleOpts
): AnyScale {
  const defaultRange = getDefaultRange(axis, width, height, reverse, range, percentRange);
  const trueScale = scale.copy();

  /* --------------------------------------------
   * Set the domain
   */
  trueScale.domain(domain);

  /* --------------------------------------------
   * Set the range of the scale to our default if
   * the scale doesn't have an interpolator function
   * or if it does, still set the range if that function
   * is the default identity function
   */
  if (
    !trueScale.interpolator ||
    (typeof trueScale.interpolator === 'function' &&
      trueScale.interpolator().name.startsWith('identity'))
  ) {
    trueScale.range(defaultRange);
  }

  if (padding) {
    trueScale.domain(padScale(scale, padding));
  }

  if (nice === true || typeof nice === 'number') {
    if (typeof trueScale.nice === 'function') {
      trueScale.nice(typeof nice === 'number' ? nice : undefined);
    } else {
      console.error(
        `[Layer Chart] You set \`${axis}Nice: true\` but the ${axis}Scale does not have a \`.nice\` method. Ignoring...`
      );
    }
  }

  return trueScale;
}
