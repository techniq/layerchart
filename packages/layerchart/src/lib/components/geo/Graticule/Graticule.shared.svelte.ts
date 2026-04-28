import type { Without } from '$lib/utils/types.js';
import type { ComponentProps } from 'svelte';
import type GeoPath from '../GeoPath/GeoPath.svelte';
import type { GeoPathProps } from '../GeoPath/GeoPath.shared.svelte.js';

export type GraticulePropsWithoutHTML = {
  lines?: Partial<ComponentProps<typeof GeoPath>> | boolean | undefined;
  outline?: Partial<ComponentProps<typeof GeoPath>> | boolean | undefined;
  stepX?: number;
  stepY?: number;
};

export type GraticuleProps = GraticulePropsWithoutHTML &
  Without<GeoPathProps, Omit<GraticulePropsWithoutHTML, 'ref'>>;
