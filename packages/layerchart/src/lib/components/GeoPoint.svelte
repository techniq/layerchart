<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import Circle, { type CirclePropsWithoutHTML } from './Circle.svelte';
  import type { Without } from 'layerchart/utils/types.js';

  export type GeoPointPropsWithoutHTML = {
    /**
     * Latitude of the point.
     */
    lat: number;

    /**
     * Longitude of the point.
     */
    long: number;

    /**
     * A bindable reference to the underlying element, which
     * can be a `<circle>` or `<g>` element.
     */
    ref?: Element;

    children?: Snippet<[{ x: number; y: number }]>;
  };

  export type GeoPointProps = Omit<
    GeoPointPropsWithoutHTML &
      Without<SVGAttributes<Element>, GeoPointPropsWithoutHTML & CirclePropsWithoutHTML>,
    'x' | 'y'
  >;
</script>

<script lang="ts">
  import Group from './Group.svelte';
  import { getRenderContext } from './Chart.svelte';
  import { getGeoContext } from './GeoContext.svelte';

  let { lat, long, ref = $bindable(), children, ...restProps }: GeoPointProps = $props();

  const geoCtx = getGeoContext();

  const points = $derived(geoCtx.projection?.([long, lat]) ?? [0, 0]);
  const x = $derived(points[0]);
  const y = $derived(points[1]);

  const renderContext = getRenderContext();
</script>

{#if renderContext === 'svg'}
  {#if children}
    <Group {x} {y} {...restProps}>
      {@render children({ x, y })}
    </Group>
  {:else}
    <Circle cx={x} cy={y} {...restProps} />
  {/if}
{/if}

{#if renderContext === 'canvas'}
  {#if children}
    <!-- TODO: Handle Canvas translation. Consolidate with svg use case above -->
    <!-- <Group {x} {y} {...$$restProps}> -->
    {@render children({ x, y })}
    <!-- </Group> -->
  {:else}
    <Circle cx={x} cy={y} {...restProps} />
  {/if}
{/if}
