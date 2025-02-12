<script lang="ts">
  import { onDestroy } from 'svelte';

  import { geoContext } from './GeoContext.svelte';
  import Circle from './Circle.svelte';
  import Group from './Group.svelte';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { getRenderContext } from './Chart.svelte';

  /** Latitude */
  export let lat: number;
  /** Longitude */
  export let long: number;

  const geo = geoContext();

  $: [x, y] = $geo([long, lat]) ?? [0, 0];

  const renderContext = getRenderContext();
  const canvasContext = getCanvasContext();
</script>

{#if renderContext === 'svg'}
  {#if $$slots.default}
    <Group {x} {y} {...$$restProps}>
      <slot {x} {y} />
    </Group>
  {:else}
    <Circle cx={x} cy={y} {...$$restProps} />
  {/if}
{/if}

{#if renderContext === 'canvas'}
  {#if $$slots.default}
    <!-- TODO: Handle Canvas translation.  Conslidate with svg use case above -->
    <!-- <Group {x} {y} {...$$restProps}> -->
    <slot {x} {y} />
    <!-- </Group> -->
  {:else}
    <Circle cx={x} cy={y} {...$$restProps} />
  {/if}
{/if}
