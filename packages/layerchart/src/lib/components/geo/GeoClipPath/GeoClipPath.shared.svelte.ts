import type { GeoPermissibleObjects } from 'd3-geo';
import type { ClipPathPropsWithoutHTML } from '../../ClipPath/ClipPath.shared.svelte.js';
import type { GeoPathPropsWithoutHTML } from '../GeoPath/GeoPath.shared.svelte.js';
import type { Without } from '$lib/utils/types.js';

export type BaseGeoClipPathPropsWithoutHTML = {
  id?: string;
  geojson: GeoPermissibleObjects;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  invert?: boolean;
  children?: ClipPathPropsWithoutHTML['children'];
};

export type GeoClipPathPropsWithoutHTML = BaseGeoClipPathPropsWithoutHTML &
  Without<GeoPathPropsWithoutHTML, BaseGeoClipPathPropsWithoutHTML>;

export type GeoClipPathProps = GeoClipPathPropsWithoutHTML;
