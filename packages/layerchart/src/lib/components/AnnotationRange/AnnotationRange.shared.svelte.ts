import type { ComponentProps } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import type { CommonStyleProps, Without } from '$lib/utils/types.js';
import type { SingleDomainType } from '$lib/utils/scales.svelte.js';
import type LinearGradient from '../LinearGradient/LinearGradient.svelte';
import type Pattern from '../Pattern/Pattern.svelte';
import type Rect from '../Rect/Rect.svelte';
import type Text from '../Text/Text.svelte';
import type { Placement } from '../types.js';

export type AnnotationRangePropsWithoutHTML = {
  x?: [SingleDomainType, SingleDomainType] | SingleDomainType[];
  y?: [SingleDomainType, SingleDomainType] | SingleDomainType[];
  label?: string;
  labelPlacement?: Placement;
  labelXOffset?: number;
  labelYOffset?: number;
  fill?: string;
  class?: string;
  gradient?: ComponentProps<typeof LinearGradient>;
  pattern?: ComponentProps<typeof Pattern>;
  props?: {
    label?: Partial<ComponentProps<typeof Text>>;
    rect?: Partial<ComponentProps<typeof Rect>>;
  };
} & CommonStyleProps;

export type AnnotationRangeProps = AnnotationRangePropsWithoutHTML &
  Without<SVGAttributes<Element>, AnnotationRangePropsWithoutHTML>;
