import type { Snippet } from 'svelte';
import type { CircleProps } from '../../Circle/Circle.shared.svelte.js';
import type { Without } from '$lib/utils/types.js';

export type GeoPointPropsWithoutHTML = {
  lat: number;
  long: number;
  ref?: Element;
  children?: Snippet<[{ x: number; y: number }]>;
};

export type GeoPointProps = Omit<
  GeoPointPropsWithoutHTML & Without<CircleProps, GeoPointPropsWithoutHTML>,
  'x' | 'y'
>;
