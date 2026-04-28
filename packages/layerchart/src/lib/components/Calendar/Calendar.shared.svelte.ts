import type { ComponentProps, Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import type { Without } from '$lib/utils/types.js';
import type MonthPath from '../MonthPath.svelte';
import type Text from '../Text/Text.svelte';
import type { RectPropsWithoutHTML } from '../Rect/Rect.shared.svelte.js';

export type CalendarCell = {
  x: number;
  y: number;
  color: any;
  data: any;
};

export type CalendarPropsWithoutHTML = {
  start: Date;
  end: Date;
  cellSize?: number | [number, number];
  /** @default false */
  monthPath?: boolean | Partial<ComponentProps<typeof MonthPath>>;
  monthLabel?: boolean | Partial<ComponentProps<typeof Text>>;
  tooltip?: boolean;
  children?: Snippet<[{ cells: CalendarCell[]; cellSize: [number, number] }]>;
} & Omit<
  RectPropsWithoutHTML,
  'children' | 'x' | 'y' | 'width' | 'height' | 'fill' | 'onpointermove' | 'onpointerleave'
>;

export type CalendarProps = CalendarPropsWithoutHTML &
  Without<SVGAttributes<SVGRectElement>, CalendarPropsWithoutHTML>;
