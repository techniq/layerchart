import type { ComponentProps, Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import type { CommonStyleProps, Without } from '$lib/utils/types.js';
import type { SingleDomainType } from '$lib/utils/scales.svelte.js';
import type Line from '../Line/Line.svelte';
import type { LineProps } from '../Line/Line.shared.svelte.js';
import type Text from '../Text/Text.svelte';
import type { TextProps } from '../Text/Text.shared.svelte.js';
import type { Placement } from '../types.js';

export type AnnotationLinePropsWithoutHTML = {
  x?: SingleDomainType;
  y?: SingleDomainType;
  /**
   * The series this annotation belongs to.
   *
   * `ChartAnnotations` hides it while another series is highlighted, and a value on the chart's
   * value axis is read against that series' stacked segment rather than taken as-is.
   */
  seriesKey?: string;
  x1?: SingleDomainType;
  y1?: SingleDomainType;
  x2?: SingleDomainType;
  y2?: SingleDomainType;
  /**
   * The label for the line.
   *
   * Can either be a string or a snippet to render custom content.
   * The snippet receives spreadable props (position, anchors and `props.label`) to apply to the label.
   */
  label?: string | Snippet<[{ props: TextProps }]>;
  labelPlacement?: Placement;
  labelXOffset?: number;
  labelYOffset?: number;
  /**
   * A snippet to render your own line in place of the default `<Line>`.
   * The snippet receives spreadable props (`x1`/`y1`/`x2`/`y2` and `props.line`).
   */
  line?: Snippet<[{ props: LineProps }]>;
  props?: {
    label?: Partial<ComponentProps<typeof Text>>;
    line?: Partial<ComponentProps<typeof Line>>;
  };
} & CommonStyleProps;

export type AnnotationLineProps = AnnotationLinePropsWithoutHTML &
  Without<SVGAttributes<Element>, AnnotationLinePropsWithoutHTML>;
