import type { Snippet } from 'svelte';
import type { Without } from '$lib/utils/types.js';
import type { GroupProps } from '../../Group/Group.shared.svelte.js';

export type GeoEdgeFadePropsWithoutHTML = {
  link: { source: [number, number]; target: [number, number] };
  /** @bindable */
  ref?: SVGGElement;
  children?: Snippet;
};

export type GeoEdgeFadeProps = GeoEdgeFadePropsWithoutHTML &
  Without<GroupProps, GeoEdgeFadePropsWithoutHTML>;
