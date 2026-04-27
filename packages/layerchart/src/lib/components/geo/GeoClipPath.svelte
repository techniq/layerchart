<script lang="ts" module>
  import type { GeoPermissibleObjects } from 'd3-geo';
  import type { Snippet } from 'svelte';

  import type { ClipPathPropsWithoutHTML } from '../ClipPath/ClipPath.svelte';
  import type { GeoPathPropsWithoutHTML } from './GeoPath.svelte';
  import type { Without } from '$lib/utils/types.js';

  export type BaseGeoClipPathPropsWithoutHTML = {
    /**
     * A unique id for the clipPath.
     */
    id?: string;

    /**
     * GeoJSON data defining the clip boundary.
     */
    geojson: GeoPermissibleObjects;

    /**
     * Whether to disable clipping (show all).
     *
     * @default false
     */
    disabled?: boolean;

    /**
     * Invert the clip — content renders *outside* the geojson shape.
     *
     * @default false
     */
    invert?: boolean;

    /**
     * The children snippet to render content inside the clipPath.
     */
    children?: ClipPathPropsWithoutHTML['children'];
  };

  export type GeoClipPathPropsWithoutHTML = BaseGeoClipPathPropsWithoutHTML &
    Without<GeoPathPropsWithoutHTML, BaseGeoClipPathPropsWithoutHTML>;

  export type GeoClipPathProps = GeoClipPathPropsWithoutHTML;
</script>

<script lang="ts">
  import { geoPath as d3GeoPath } from 'd3-geo';

  import ClipPath from '../ClipPath/ClipPath.svelte';
  import { createId } from '$lib/utils/createId.js';
  import { getGeoContext } from '$lib/contexts/geo.js';

  const uid = $props.id();

  let {
    id = createId('clipPath-', uid),
    geojson,
    disabled = false,
    invert = false,
    children,
  }: GeoClipPathProps = $props();

  const geo = getGeoContext();

  // d3-geo-path emits an SVG path `d` string that Path2D and
  // `clip-path: path()` also accept — single source of truth for all layers.
  const path = $derived(
    geo.projection && geojson ? (d3GeoPath(geo.projection)(geojson) ?? undefined) : undefined
  );
</script>

<ClipPath {id} {disabled} {invert} {children} {path} />
