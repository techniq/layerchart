<script lang="ts">
  import { geoGraticule } from 'd3-geo';
  import type { ComponentProps } from 'svelte';

  import GeoPath from './GeoPath.svelte';

  // TODO: Support full api (stepMinor/Major, extent[Minor/Major], etc
  export let lines: Partial<ComponentProps<GeoPath>> | boolean | undefined = undefined;
  export let outline: Partial<ComponentProps<GeoPath>> | boolean | undefined = undefined;
  export let step: [number, number] = [10, 10];

  $: graticule = geoGraticule();

  $: graticule.step(step);
</script>

<g class="graticule">
  <!-- TODO: Any reason to still render the single `MultiLineString` path if using `lines` and/or `outline` -->
  {#if !lines && !outline}
    <GeoPath geojson={graticule()} {...$$restProps} />
  {/if}

  {#if lines}
    {#each graticule.lines() as line}
      <GeoPath geojson={line} {...typeof lines === 'object' ? lines : null} />
    {/each}
  {/if}

  {#if outline}
    <GeoPath geojson={graticule.outline()} {...typeof outline === 'object' ? outline : null} />
  {/if}
</g>
