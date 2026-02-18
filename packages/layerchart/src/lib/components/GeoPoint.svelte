<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import Circle, { type CircleProps } from './Circle.svelte';
  import type { Without } from '$lib/utils/types.js';

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
    GeoPointPropsWithoutHTML & Without<CircleProps, GeoPointPropsWithoutHTML>,
    'x' | 'y'
  >;
</script>

<script lang="ts">
  import Group from './Group.svelte';
  import { getLayerContext } from '$lib/contexts/layer.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  let { lat, long, ref: refProp = $bindable(), children, ...restProps }: GeoPointProps = $props();

  let ref = $state<Element>();
  $effect.pre(() => {
    refProp = ref;
  });

  const geoCtx = getGeoContext();

  const points = $derived(geoCtx.projection?.([long, lat]) ?? [0, 0]);
  const x = $derived(points[0]);
  const y = $derived(points[1]);

  const layerCtx = getLayerContext();
</script>

{#if layerCtx === 'svg'}
  {#if children}
    <Group {x} {y} {...extractLayerProps(restProps, 'lc-geo-point-group')}>
      {@render children({ x, y })}
    </Group>
  {:else}
    <Circle cx={x} cy={y} {...extractLayerProps(restProps, 'lc-geo-point')} />
  {/if}
{/if}

{#if layerCtx === 'canvas'}
  {#if children}
    <!-- TODO: Handle Canvas translation. Consolidate with svg use case above -->
    <!-- <Group {x} {y} {...$$restProps}> -->
    {@render children({ x, y })}
    <!-- </Group> -->
  {:else}
    <Circle cx={x} cy={y} {...extractLayerProps(restProps, 'lc-geo-point')} />
  {/if}
{/if}
