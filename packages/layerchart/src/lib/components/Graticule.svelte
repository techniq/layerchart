<script lang="ts" module>
  import type { Without } from '$lib/utils/types.js';
  import type { ComponentProps } from 'svelte';
  import GeoPath, { type GeoPathProps } from './GeoPath.svelte';

  export type GraticulePropsWithoutHTML = {
    lines?: Partial<ComponentProps<typeof GeoPath>> | boolean | undefined;
    outline?: Partial<ComponentProps<typeof GeoPath>> | boolean | undefined;
    stepX?: number;
    stepY?: number;
  };

  export type GraticuleProps = GraticulePropsWithoutHTML &
    Without<GeoPathProps, Omit<GraticulePropsWithoutHTML, 'ref'>>;
</script>

<script lang="ts">
  import { geoGraticule } from 'd3-geo';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import Group from './Group.svelte';

  let { lines, outline, stepX = 10, stepY = 10, ...restProps }: GraticuleProps = $props();

  const graticule = $derived(geoGraticule().step([stepX, stepY]));
</script>

<Group class="lc-graticule-g">
  <!-- TODO: Any reason to still render the single `MultiLineString` path if using `lines` and/or `outline` -->
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
