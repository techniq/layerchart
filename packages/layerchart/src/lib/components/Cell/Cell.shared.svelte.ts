import type { RectProps } from '../Rect/Rect.shared.svelte.js';
import type { DataProp } from '$lib/utils/dataProp.js';

type BaseRectCellProps = Omit<
  RectProps,
  | 'width'
  | 'height'
  | 'x0'
  | 'x1'
  | 'y0'
  | 'y1'
  | 'initialX'
  | 'initialY'
  | 'initialWidth'
  | 'initialHeight'
  | 'motion'
  | 'ref'
>;

export type CellProps = BaseRectCellProps & {
  /** @default 'rect' */
  shape?: 'rect' | 'circle';
  /** Radius for circle shape. */
  r?: DataProp;
};
