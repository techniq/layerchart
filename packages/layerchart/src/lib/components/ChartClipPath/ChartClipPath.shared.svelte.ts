import type { Snippet } from 'svelte';
import type { Without } from '$lib/utils/types.js';
import type { RectClipPathProps } from '../RectClipPath/RectClipPath.shared.svelte.js';

export type ChartClipPathPropsWithoutHTML = {
  /** Include padding area (ex. axis) @default false */
  full?: boolean;
  /** Disable clipping (show all) @default false */
  disabled?: boolean;
  children?: Snippet;
};

export type ChartClipPathProps = ChartClipPathPropsWithoutHTML &
  Without<Omit<RectClipPathProps, 'width' | 'height'>, ChartClipPathPropsWithoutHTML>;
