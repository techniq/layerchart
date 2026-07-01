import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import type { Without } from '$lib/utils/types.js';
import type { DataProp, DataDrivenStyleProps } from '$lib/utils/dataProp.js';
import type { VectorAnchor } from '$lib/utils/path.js';
import type { MotionProp } from '$lib/utils/motion.svelte.js';

export type VectorShape = 'arrow' | 'arrow-filled' | 'spike';

export type VectorPropsWithoutHTML = {
  /** @default 0 */
  x?: DataProp;
  /** @default x */
  initialX?: number;
  /** @default 0 */
  y?: DataProp;
  /** @default y */
  initialY?: number;
  /** @default 12 */
  length?: DataProp;
  /** @default length */
  initialLength?: number;
  /** @default 0 */
  rotate?: DataProp;
  /** @default 'arrow' */
  shape?: VectorShape;
  anchor?: VectorAnchor;
  /** Width of the vector shape in pixels. */
  width?: number;
  data?: any[];
  /** @default (d, i) => i */
  key?: (d: any, index: number) => any;
  motion?: MotionProp;
  children?: Snippet<[{ length: number; d?: any }]>;
} & DataDrivenStyleProps;

export type VectorProps = VectorPropsWithoutHTML &
  Without<SVGAttributes<SVGPathElement>, VectorPropsWithoutHTML>;
