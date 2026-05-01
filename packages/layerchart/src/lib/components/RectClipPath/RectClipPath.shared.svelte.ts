import type { CommonEvents, Without } from '$lib/utils/types.js';
import type { SVGAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
import type { RectPropsWithoutHTML } from '../Rect/Rect.shared.svelte.js';
import type { MotionProp } from '$lib/utils/motion.svelte.js';

export type BaseRectClipPathPropsWithoutHTML = {
  /** A unique id for the clipPath. */
  id?: string;
  /** The x position of the clipPath. @default 0 */
  x?: number;
  /** The initial x position (used as the animation start when `motion` is set). @default x */
  initialX?: number;
  /** The y position of the clipPath. @default 0 */
  y?: number;
  /** The initial y position (used as the animation start when `motion` is set). @default y */
  initialY?: number;
  /** The width of the clipPath. @required */
  width: number;
  /** The initial width (used as the animation start when `motion` is set). @default width */
  initialWidth?: number;
  /** The height of the clipPath. @required */
  height: number;
  /** The initial height (used as the animation start when `motion` is set). @default height */
  initialHeight?: number;
  /** Whether to disable clipping (show all). @default false */
  disabled?: boolean;
  /** Invert the clip — content renders *outside* the rect. @default false */
  invert?: boolean;
  /** The default children snippet which provides the id and url for the clipPath. */
  children?: Snippet<[{ id: string; url: string }]>;
  motion?: MotionProp<'x' | 'y' | 'width' | 'height'>;
};

export type RectClipPathPropsWithoutHTML = BaseRectClipPathPropsWithoutHTML &
  Without<RectPropsWithoutHTML, BaseRectClipPathPropsWithoutHTML>;

export type RectClipPathProps = RectClipPathPropsWithoutHTML &
  Without<SVGAttributes<SVGElement>, RectClipPathPropsWithoutHTML> &
  CommonEvents;
