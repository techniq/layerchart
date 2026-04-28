import type { PointerEventHandler, SVGAttributes } from 'svelte/elements';

import type { PathPropsWithoutHTML } from '../../Path/Path.shared.svelte.js';
import type { MotionProp } from '$lib/utils/motion.svelte.js';
import type { CommonStyleProps, Without } from '$lib/utils/types.js';

export type RibbonPropsWithoutHTML = {
  chord: import('d3-chord').Chord;
  radius?: number;
  /** @default false */
  directed?: boolean;
  headRadius?: number;
  tooltip?: boolean;
  data?: any;
  motion?: MotionProp;
  onpointerenter?: PointerEventHandler<SVGPathElement>;
  onpointermove?: PointerEventHandler<SVGPathElement>;
  onpointerleave?: PointerEventHandler<SVGPathElement>;
  ontouchmove?: (e: TouchEvent & { currentTarget: SVGPathElement }) => void;
} & CommonStyleProps;

export type RibbonProps = RibbonPropsWithoutHTML &
  Without<SVGAttributes<SVGPathElement>, RibbonPropsWithoutHTML & PathPropsWithoutHTML>;
