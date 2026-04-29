<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { GraticuleProps } from './Graticule.shared.svelte.js';

  export type GraticuleBaseLayerComponents = {
    Group: Component<any>;
    GeoPath: Component<any>;
  };

  export type GraticuleBaseProps = GraticuleProps & GraticuleBaseLayerComponents;
</script>

<script lang="ts">
  import { geoGraticule } from 'd3-geo';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  let {
    Group,
    GeoPath,
    lines,
    outline,
    stepX = 10,
    stepY = 10,
    ...restProps
  }: GraticuleBaseProps = $props();

  const graticule = $derived(geoGraticule().step([stepX, stepY]));
</script>

<Group class="lc-graticule-g">
  {#if !lines && !outline}
    <GeoPath geojson={graticule()} {...extractLayerProps(restProps, 'lc-graticule-geo-path')} />
  {/if}

  {#if lines}
    {#each graticule.lines() as line}
      <GeoPath geojson={line} {...extractLayerProps(lines, 'lc-graticule-geo-line')} />
    {/each}
  {/if}

  {#if outline}
    <GeoPath
      geojson={graticule.outline()}
      {...extractLayerProps(outline, 'lc-graticule-geo-outline')}
    />
  {/if}
</Group>
