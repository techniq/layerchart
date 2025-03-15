import { motionState, type MotionProps } from 'layerchart/stores/motionStore.js';
import type { AnyScale } from './scales.js';

// this may need to become a getter for options so we can reactively update after mount
export function motionScaleState<Domain, Range>(scale: AnyScale, options: MotionProps) {
  const domain = motionState<Domain>(undefined as Domain, options);
  const range = motionState<Range>(undefined as Range, options);

  const tweenedScale = $derived.by(() => {
    // @ts-expect-error
    const scaleInstance = scale.domain ? scale : scale(); // support `scaleLinear` or `scaleLinear()` (which could have `.interpolate()` and others set)

    if (domain.current) {
      scaleInstance.domain(domain.current);
    }
    if (range.current) {
      scaleInstance.range(range.current);
    }

    return scaleInstance;
  });

  return {
    get current() {
      return tweenedScale;
    },
    domain: (values: Domain) => domain.set(values),
    range: (values: Range) => range.set(values),
  };
}
