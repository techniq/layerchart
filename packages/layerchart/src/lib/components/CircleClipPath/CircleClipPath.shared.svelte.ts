import type { MotionProp } from '$lib/utils/motion.svelte.js';
import type { ClipPathPropsWithoutHTML } from '../ClipPath/ClipPath.shared.svelte.js';

export type CircleClipPathPropsWithoutHTML = {
  /** A unique id for the clipPath. */
  id?: string;
  /** The center x position of the circle. @default 0 */
  cx?: number;
  /** The center y position of the circle. @default 0 */
  cy?: number;
  /** The radius of the circle. @required */
  r: number;
  /** Whether to disable clipping (show all). @default false */
  disabled?: boolean;
  /** Invert the clip — content renders *outside* the circle. @default false */
  invert?: boolean;
  /** A bindable reference to the underlying `<circle>` element @bindable */
  ref?: SVGCircleElement;
  children?: ClipPathPropsWithoutHTML['children'];
  motion?: MotionProp;
};
