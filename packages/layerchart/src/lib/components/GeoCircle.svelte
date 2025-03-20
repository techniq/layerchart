<script lang="ts" module>
  import GeoPath, { type GeoPathProps } from './GeoPath.svelte';
  import type { Without } from 'layerchart/utils/types.js';
  export type GeoCirclePropsWithoutHTML = {
    /**
     * The radius of the circle in degrees.
     * @default 90
     */
    radius?: number;

    /**
     * The center point of the circle in degrees ([longitude, latitude]).
     * @default [0, 0]
     */
    center?: [number, number];

    /**
     * The precision of the circle in degrees.
     * @default 6
     */
    precision?: number;
  };

  export type GeoCircleProps = GeoCirclePropsWithoutHTML &
    Without<GeoPathProps, GeoCirclePropsWithoutHTML>;
</script>

<script lang="ts">
  import { geoCircle } from 'd3-geo';
  import { createDataAttr } from 'layerchart/utils/attributes.js';

  let { radius = 90, center = [0, 0], precision = 6, ...restProps }: GeoCircleProps = $props();

  const geojson = $derived(geoCircle().radius(radius).center(center).precision(precision)());
</script>

<GeoPath {geojson} {...createDataAttr('geo-circle')} {...restProps} />
