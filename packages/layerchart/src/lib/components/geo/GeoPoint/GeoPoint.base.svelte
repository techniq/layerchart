<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { GeoPointProps } from './GeoPoint.shared.svelte.js';

  export type GeoPointBaseLayerComponents = {
    Circle: Component<any>;
    Group: Component<any>;
  };

  export type GeoPointBaseProps = GeoPointProps & GeoPointBaseLayerComponents;
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  let {
    Circle,
    Group,
    lat,
    long,
    ref: refProp = $bindable(),
    children,
    opacity,
    fillOpacity,
    strokeWidth,
    class: className,
    ...restProps
  }: GeoPointBaseProps = $props();

  let ref = $state<Element>();
  $effect.pre(() => {
    refProp = ref;
  });

  const geo = getGeoContext();

  const points = $derived(geo.projection?.([long, lat]) ?? [0, 0]);
  const x = $derived(points[0]);
  const y = $derived(points[1]);

  const layerCtx = getLayerContext();
</script>

{#if layerCtx === 'svg'}
  {#if children}
    <Group
      {x}
      {y}
      opacity={opacity as number}
      class={className as string}
      {...extractLayerProps(restProps, 'lc-geo-point-group')}
    >
      {@render children({ x, y })}
    </Group>
  {:else}
    <Circle
      cx={x}
      cy={y}
      {opacity}
      {fillOpacity}
      {strokeWidth}
      class={className}
      {...extractLayerProps(restProps, 'lc-geo-point')}
    />
  {/if}
{/if}

{#if layerCtx === 'canvas'}
  {#if children}
    {@render children({ x, y })}
  {:else}
    <Circle
      cx={x}
      cy={y}
      {opacity}
      {fillOpacity}
      {strokeWidth}
      class={className}
      {...extractLayerProps(restProps, 'lc-geo-point')}
    />
  {/if}
{/if}
