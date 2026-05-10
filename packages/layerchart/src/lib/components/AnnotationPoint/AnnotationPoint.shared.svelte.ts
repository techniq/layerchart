import type { ComponentProps } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import type { CommonStyleProps, Without } from '$lib/utils/types.js';
import type { SingleDomainType } from '$lib/utils/scales.svelte.js';
import type Circle from '../Circle/Circle.svelte';
import type Link from '../Link/Link.svelte';
import type Text from '../Text/Text.svelte';
import type { Placement } from '../types.js';

export type AnnotationPointPropsWithoutHTML = {
  x?: SingleDomainType;
  y?: SingleDomainType;
  r?: number;
  label?: string;
  labelPlacement?: Placement;
  labelXOffset?: number;
  labelYOffset?: number;
  link?: boolean | Partial<ComponentProps<typeof Link>>;
  details?: any;
  props?: {
    label?: Partial<ComponentProps<typeof Text>>;
    circle?: Partial<ComponentProps<typeof Circle>>;
  };
} & CommonStyleProps;

export type AnnotationPointProps = AnnotationPointPropsWithoutHTML &
  Without<SVGAttributes<Element>, AnnotationPointPropsWithoutHTML>;
