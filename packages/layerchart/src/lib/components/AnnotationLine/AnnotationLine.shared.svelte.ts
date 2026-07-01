import type { ComponentProps } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import type { CommonStyleProps, Without } from '$lib/utils/types.js';
import type { SingleDomainType } from '$lib/utils/scales.svelte.js';
import type Line from '../Line/Line.svelte';
import type Text from '../Text/Text.svelte';
import type { Placement } from '../types.js';

export type AnnotationLinePropsWithoutHTML = {
  x?: SingleDomainType;
  y?: SingleDomainType;
  x1?: SingleDomainType;
  y1?: SingleDomainType;
  x2?: SingleDomainType;
  y2?: SingleDomainType;
  label?: string;
  labelPlacement?: Placement;
  labelXOffset?: number;
  labelYOffset?: number;
  props?: {
    label?: Partial<ComponentProps<typeof Text>>;
    line?: Partial<ComponentProps<typeof Line>>;
  };
} & CommonStyleProps;

export type AnnotationLineProps = AnnotationLinePropsWithoutHTML &
  Without<SVGAttributes<Element>, AnnotationLinePropsWithoutHTML>;
