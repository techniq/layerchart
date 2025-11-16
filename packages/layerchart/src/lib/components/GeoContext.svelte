<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import { type GeoPermissibleObjects, type GeoProjection } from 'd3-geo';
  import { GeoState } from '$lib/states/geo.svelte.js';

  export type GeoContextProps = {
    /**
     * A d3 projection function. Pass this in as an uncalled function, e.g.
     * `projection={geoAlbersUsa}`.
     */
    projection?: () => GeoProjection;
    fitGeojson?: GeoPermissibleObjects;
    /**
     * By default, the map fills to fit the $width and $height. If instead you want a
     * fixed-aspect ratio, like for a server-side rendered map, set that here.
     */
    fixedAspectRatio?: number;
    clipAngle?: number;
    clipExtent?: [[number, number], [number, number]];
    rotate?: {
      /** Lambda (Center Meridian) */
      yaw: number;
      /** Phi */
      pitch: number;
      /** Gamma */
      roll: number;
    };
    scale?: number;
    translate?: [number, number];
    center?: [number, number];
    /**
     * Apply TransformContext to the selected properties.  Typically `translate` or `rotate` are
     * mutually selected
     */
    applyTransform?: ('scale' | 'translate' | 'rotate')[];
    reflectX?: boolean;
    reflectY?: boolean;
    /**
     * Exposed to allow binding in Chart
     *
     * @bindable
     */
    geoState?: GeoState;
    /**
     * Backwards compatible binding (deprecated - use geoState instead)
     *
     * @bindable
     * @deprecated Use geoState instead
     */
    geoContext?: GeoState;

    children: Snippet<[{ geoState: GeoState }]>;
  };
</script>

<script lang="ts">
  import { setGeoContext } from '$lib/contexts/geo.js';
  import { getTransformContext } from '$lib/contexts/transform.js';
  import { getChartContext } from '$lib/contexts/chart.js';

  let {
    geoState: geoStateProp = $bindable() as GeoState,
    geoContext: geoContextProp = $bindable() as GeoState,
    ...props
  }: GeoContextProps = $props();

  const chartCtx = getChartContext();
  const transformCtx = getTransformContext();

  // Create GeoState instance
  const geoState = new GeoState(() => props);
  geoStateProp = geoState;

  // Sync chart dimensions to geo state
  $effect(() => {
    geoState.chartWidth = chartCtx.width;
    geoState.chartHeight = chartCtx.height;
  });

  // Sync transform context to geo state
  $effect(() => {
    geoState.transformScale = transformCtx.scale;
    geoState.transformTranslateX = transformCtx.translate.x;
    geoState.transformTranslateY = transformCtx.translate.y;
  });

  // Set both bindable props for backwards compatibility
  geoContextProp = geoState;

  setGeoContext(geoState);
</script>

{@render props.children({
  geoState,
})}
