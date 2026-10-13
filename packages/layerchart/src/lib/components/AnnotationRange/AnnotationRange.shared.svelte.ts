import type { ComponentProps, Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import type { CommonStyleProps, Without } from '$lib/utils/types.js';
import type { SingleDomainType } from '$lib/utils/scales.svelte.js';
import type LinearGradient from '../LinearGradient/LinearGradient.svelte';
import type Pattern from '../Pattern/Pattern.svelte';
import type Rect from '../Rect/Rect.svelte';
import type { RectProps } from '../Rect/Rect.shared.svelte.js';
import type Text from '../Text/Text.svelte';
import type { TextProps } from '../Text/Text.shared.svelte.js';
import type { Placement } from '../types.js';

export type AnnotationRangePropsWithoutHTML = {
  x?: [SingleDomainType, SingleDomainType] | SingleDomainType[];
  y?: [SingleDomainType, SingleDomainType] | SingleDomainType[];
  /**
   * The series this annotation belongs to.  `ChartAnnotations` hides it while another series is
   * highlighted.
   *
   * Unlike `AnnotationPoint` / `AnnotationLine`, the bounds are left as given over a stack: a
   * range spans two values, and which segment each end belongs to is ambiguous.
   */
  seriesKey?: string;
  /**
   * The label for the range.
   *
   * Can either be a string or a snippet to render custom content.
   * The snippet receives spreadable props (position, anchors and `props.label`) to apply to the label.
   */
  label?: string | Snippet<[{ props: TextProps }]>;
  labelPlacement?: Placement;
  labelXOffset?: number;
  labelYOffset?: number;
  fill?: string;
  class?: string;
  gradient?: ComponentProps<typeof LinearGradient>;
  pattern?: ComponentProps<typeof Pattern>;
  /**
   * A snippet to render your own range in place of the default `<Rect>`.
   * The snippet receives spreadable props (`x`/`y`/`width`/`height`, `fill`, `class` and `props.rect`).
   * `gradient` / `pattern` fills are still drawn on their own.
   */
  rect?: Snippet<[{ props: RectProps }]>;
  props?: {
    label?: Partial<ComponentProps<typeof Text>>;
    rect?: Partial<ComponentProps<typeof Rect>>;
  };
} & CommonStyleProps;

export type AnnotationRangeProps = AnnotationRangePropsWithoutHTML &
  Without<SVGAttributes<Element>, AnnotationRangePropsWithoutHTML>;
