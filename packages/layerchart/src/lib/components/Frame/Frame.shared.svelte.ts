import type { Without } from '$lib/utils/types.js';
import type { RectProps, RectPropsWithoutHTML } from '../Rect/Rect.shared.svelte.js';

export type FramePropsWithoutHTML = RectPropsWithoutHTML & {
  /** Whether to include padding area @default false */
  full?: boolean;
};

export type FrameProps = Omit<
  FramePropsWithoutHTML & Without<RectProps, FramePropsWithoutHTML>,
  'width' | 'height'
>;
