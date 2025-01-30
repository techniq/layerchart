<script lang="ts">
  import { geoCircle } from 'd3-geo';

  import GeoPath from './GeoPath.svelte';
  import type { ComponentProps } from 'svelte';

  /** Radius in degrees.  Default: 90 */
  export let radius = 90;

  /** Center point of circle in degree ([longitude, latitude]).  Default [0, 0] */
  export let center: [number, number] = [0, 0];

  /** sets the circle precision to the specified angle in degrees */
  export let precision = 6;

  export let onclick: ComponentProps<typeof GeoPath>['onclick'] = undefined;
  export let onpointerenter: ComponentProps<typeof GeoPath>['onpointerenter'] = undefined;
  export let onpointermove: ComponentProps<typeof GeoPath>['onpointermove'] = undefined;
  export let onpointerleave: ComponentProps<typeof GeoPath>['onpointerleave'] = undefined;

  $: geojson = geoCircle().radius(radius).center(center).precision(precision)();
</script>

<GeoPath {geojson} {onclick} {onpointerenter} {onpointermove} {onpointerleave} {...$$restProps} />
