import findScaleName from './find-scale-name.js';
import { getPadFunctions } from './get-pad-functions.js';
import { isOrdinalDomain } from './is-ordinal-domain.js';
import type { AnyScale } from './scales.js';
import type { Padding, PaddingArray } from './types.js';

// These scales have a discrete range so they can't be padded
const unpaddable = ['scaleThreshold', 'scaleQuantile', 'scaleQuantize', 'scaleSequentialQuantile'];

export default function padScale(scale: AnyScale, padding: PaddingArray | undefined) {
  if (typeof scale.range !== 'function') {
    throw new Error('Scale method `range` must be a function');
  }
  if (typeof scale.domain !== 'function') {
    throw new Error('Scale method `domain` must be a function');
  }

  if (!Array.isArray(padding) || unpaddable.includes(findScaleName(scale))) {
    return scale.domain();
  }

  if (isOrdinalDomain(scale) === true) return scale.domain();

  const { lift, ground } = getPadFunctions(scale);

  const d0 = scale.domain()[0];

  const isTime = Object.prototype.toString.call(d0) === '[object Date]';

  const [d1, d2] = scale.domain().map((d) => {
    return isTime ? lift(d.getTime()) : lift(d);
  });

  const [r1, r2] = scale.range();
  const paddingLeft = padding[0] || 0;
  const paddingRight = padding[1] || 0;

  const step = (d2 - d1) / (Math.abs(r2 - r1) - paddingLeft - paddingRight);

  return [d1 - paddingLeft * step, paddingRight * step + d2].map((d) => {
    return isTime ? ground(new Date(d).getTime()) : ground(d);
  });
}
