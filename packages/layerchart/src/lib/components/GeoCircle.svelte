<script lang="ts">
  import { geoCircle } from 'd3-geo';

  import GeoPath from './GeoPath.svelte';

  /** Radius in degrees.  Default: 90 */
  export let radius = 90;

  /** Center point of circle in degree ([longitude, latitude]).  Default [0, 0] */
  export let center: [number, number] = [0, 0];

  /** sets the circle precision to the specified angle in degrees */
  export let precision = 6;

  $: geojson = geoCircle().radius(radius).center(center).precision(precision)();
</script>

<GeoPath {geojson} {...$$restProps} on:pointermove on:pointerleave on:click />
