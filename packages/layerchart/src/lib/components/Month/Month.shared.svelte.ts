import type { ComponentProps, Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import type { Without } from '$lib/utils/types.js';
import type Text from '../Text/Text.svelte';
import type { RectPropsWithoutHTML } from '../Rect/Rect.shared.svelte.js';

export type MonthCell = {
  x: number;
  y: number;
  color: any;
  data: any;
  date: Date;
};

export type MonthPropsWithoutHTML = {
  start: Date;
  end: Date;
  /** @default 25 */
  cellSize?: number;
  monthsPerRow?: number;
  /** @default 1.2 */
  monthPadding?: number;
  /** @default 8 */
  rowSpacing?: number;
  /** @default true */
  showDayNumber?: boolean;
  monthLabel?: boolean | Partial<ComponentProps<typeof Text>>;
  dayNumberProps?: Partial<ComponentProps<typeof Text>>;
  tooltip?: boolean;
  children?: Snippet<[{ cells: MonthCell[]; cellSize: number }]>;
} & Omit<
  RectPropsWithoutHTML,
  'children' | 'x' | 'y' | 'width' | 'height' | 'fill' | 'onpointermove' | 'onpointerleave'
>;

export type MonthProps = MonthPropsWithoutHTML &
  Without<SVGAttributes<SVGRectElement>, MonthPropsWithoutHTML>;
