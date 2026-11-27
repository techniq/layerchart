<script lang="ts" module>
  import type { GeoPointProps } from './GeoPoint.shared.svelte.js';
</script>

<!-- LayerChart's `GeoPoint`, drawn with these marks -->
<script lang="ts">
  import { getChartContext } from 'layerchart';
  import Circle from '../Circle/Circle.webgl.svelte';
  import Group from '../Group/Group.webgl.svelte';

  let { lat, long, ref: _ref, children, ...restProps }: GeoPointProps = $props();
  /** Its circle's props, as core's `Circle` takes them (ex. `r`, `class`) */
  const circleProps = $derived(restProps as Record<string, any>);

  const ctx = getChartContext();

  const point = $derived(ctx.geo.projection?.([long, lat]) ?? [0, 0]);
  const x = $derived(point[0]);
  const y = $derived(point[1]);
</script>

{#if children}
  <!-- As core's `GeoPoint` in an `Svg` layer: its contents placed by a `Group` at the point (and
  given it, ex. for a mark that places itself) -->
  <Group {x} {y} opacity={circleProps.opacity}>
    {@render children({ x, y })}
  </Group>
{:else}
  <Circle cx={x} cy={y} {...circleProps} />
{/if}
