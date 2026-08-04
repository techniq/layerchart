import type { ComponentProps } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import type { CommonStyleProps, Without } from '$lib/utils/types.js';
import type { SingleDomainType } from '$lib/utils/scales.svelte.js';
import type Circle from '../Circle/Circle.svelte';
import type Link from '../Link/Link.svelte';
import type Text from '../Text/Text.svelte';
import type { Placement } from '../types.js';

export type AnnotationPointPropsWithoutHTML = {
  /** x value of the point */
  x?: SingleDomainType;
  /** y value of the point */
  y?: SingleDomainType;
  /** Radius of the circle */
  r?: number;
  /** Label to display on circle */
  label?: string;
  /**
   * Where to place the label relative to the point. `'smart'` derives the
   * placement (text anchor + link direction) from the geometry between the
   * point and the label position — useful with an explicit `labelX`/`labelY`
   * from a layout (voronoi centroid, `Dodge`, force sim, etc.).
   */
  labelPlacement?: Placement | 'smart';
  /** X offset of the label */
  labelXOffset?: number;
  /** Y offset of the label */
  labelYOffset?: number;
  /**
   * Explicit pixel x position for the label, overriding the `labelPlacement`
   * offset from the point. Pair with `labelPlacement="smart"` to auto-orient.
   */
  labelX?: number;
  /** Explicit pixel y position for the label. See {@link labelX}. */
  labelY?: number;
  /**
   * Label font size (number = pixels). Also feeds the vertical-centering and
   * link-edge math, so set it when using a non-default label size.
   *
   * @default 12
   */
  fontSize?: number | string;
  /**
   * Pixels of spacing left between the leader `link` and the label (the link
   * stops short of the label edge). No effect without `link`.
   *
   * @default 4
   */
  labelGap?: number;
  /**
   * Draw a `<Link>` from the ring edge to the label (d3-ring-note style).
   * Pass `true` for a straight line, or an object to configure the `Link`
   * (e.g. `{ type: 'beveled', radius: 20 }`).
   */
  link?: boolean | Partial<ComponentProps<typeof Link>>;
  /** Details (description, etc) useful to display in tooltip */
  details?: any;
  /** Classes for inner elements */
  props?: {
    label?: Partial<ComponentProps<typeof Text>>;
    circle?: Partial<ComponentProps<typeof Circle>>;
  };
} & CommonStyleProps;

export type AnnotationPointProps = AnnotationPointPropsWithoutHTML &
  Without<SVGAttributes<Element>, AnnotationPointPropsWithoutHTML>;
