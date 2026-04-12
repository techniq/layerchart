<script lang="ts" module>
  import type { GeoPermissibleObjects } from 'd3-geo';
  import type { Snippet } from 'svelte';

  import type { ClipPathPropsWithoutHTML } from './ClipPath.svelte';
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

  import ClipPath from './ClipPath.svelte';
  import GeoPath from './GeoPath.svelte';
  import { createId } from '$lib/utils/createId.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { getGeoContext } from '$lib/contexts/geo.js';

  const uid = $props.id();

  let {
    id = createId('clipPath-', uid),
    geojson,
    disabled = false,
    children,
    ...restProps
  }: GeoClipPathProps = $props();

  const geo = getGeoContext();

  function canvasClip(ctx: CanvasRenderingContext2D) {
    if (!geo.projection || !geojson) return;
    const pathGen = d3GeoPath(geo.projection, ctx);
    pathGen(geojson);
  }

  function canvasClipDeps() {
    return [geojson, geo.projection];
  }
</script>

<ClipPath {id} {disabled} {children} {canvasClip} {canvasClipDeps}>
  {#snippet clip()}
    <GeoPath {geojson} class="stroke-none" {...extractLayerProps(restProps, 'lc-clip-path-geo')} />
  {/snippet}
</ClipPath>
