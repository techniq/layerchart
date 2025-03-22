<script lang="ts" module>
  import type { Without } from '$lib/utils/types.js';
  import type { ComponentProps } from 'svelte';
  import GeoPath, { type GeoPathProps } from './GeoPath.svelte';

  export type GraticulePropsWithoutHTML = {
    lines?: Partial<ComponentProps<typeof GeoPath>> | boolean | undefined;
    outline?: Partial<ComponentProps<typeof GeoPath>> | boolean | undefined;
    step?: [number, number];
  };

  export type GraticuleProps = GraticulePropsWithoutHTML &
    Without<GeoPathProps, Omit<GraticulePropsWithoutHTML, 'ref'>>;
</script>

<script lang="ts">
  import { geoGraticule } from 'd3-geo';
  import { createDataAttr } from '$lib/utils/attributes.js';

  let { lines, outline, step = [10, 10], ...restProps }: GraticuleProps = $props();

  const graticule = geoGraticule();

  $effect(() => {
    graticule.step(step);
  });

  const pathAttr = createDataAttr('graticule-path');
</script>

<g {...createDataAttr('graticule-root')}>
  <!-- TODO: Any reason to still render the single `MultiLineString` path if using `lines` and/or `outline` -->
  {#if !lines && !outline}
    <GeoPath {...pathAttr} geojson={graticule()} {...restProps} />
  {/if}

  {#if lines}
    {#each graticule.lines() as line}
      <GeoPath {...pathAttr} geojson={line} {...typeof lines === 'object' ? lines : null} />
    {/each}
  {/if}

  {#if outline}
    <GeoPath
      {...pathAttr}
      geojson={graticule.outline()}
      {...typeof outline === 'object' ? outline : null}
    />
  {/if}
</g>
