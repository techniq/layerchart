<script lang="ts" module>
  import type { GraticuleProps } from './Graticule.shared.svelte.js';
</script>

<!-- A map's meridians and parallels, as the core `Graticule` draws them -->
<script lang="ts">
  import { geoGraticule } from 'd3-geo';
  import GeoPath from '../GeoPath/GeoPath.webgl.svelte';

  let { lines, outline, stepX = 10, stepY = 10, ...props }: GraticuleProps = $props();

  const graticule = $derived(geoGraticule().step([stepX, stepY]));
  const own = (p: GraticuleProps['lines']) => (typeof p === 'object' ? p : {});
</script>

{#if !lines && !outline}
  <!-- Its own `geojson` in place of the graticule's, as the core `Graticule` takes it -->
  <GeoPath geojson={graticule()} {...props} />
{/if}

{#if lines}
  {#each graticule.lines() as line}
    <GeoPath {...props} {...own(lines)} geojson={line} />
  {/each}
{/if}

{#if outline}
  <GeoPath {...props} {...own(outline)} geojson={graticule.outline()} />
{/if}
