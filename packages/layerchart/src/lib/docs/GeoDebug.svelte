<script lang="ts">
  import { getContext } from 'svelte';
  import { format, Checkbox, cls } from 'svelte-ux';

  import { geoContext } from '$lib/components/GeoContext.svelte';

  const { width, height } = getContext('LayerCake');
  const geo = geoContext();

  let showCenter = false;
</script>

<div class={cls('bg-surface-300/50 rounded m-1 backdrop-blur p-2 tabular-nums', $$props.class)}>
  <div class="grid gap-2 text-xs">
    <div><span class="opacity-50">scale:</span> {format($geo.scale(), 'decimal')}</div>

    <div>
      <span class="opacity-50">translate:</span>
      {#each $geo.translate() as coord}
        <div class="text-right">{format(coord, 'decimal')}</div>
      {/each}
    </div>

    <div>
      <span class="opacity-50">rotate:</span>
      {#each $geo.rotate() as angle}
        <div class="text-right">{format(angle, 'decimal')}</div>
      {/each}
    </div>

    <div class="grid grid-cols-[auto,1fr]">
      <span class="opacity-50">center:</span>
      <span class="text-right">
        {$geo.center?.()}
      </span>
    </div>

    <div>
      <span class="opacity-50">long/lat: <Checkbox bind:checked={showCenter} size="xs" /></span>
      {#each $geo.invert?.([$width / 2, $height / 2]) as coord}
        <div class="text-right">{format(coord, 'decimal')}</div>
      {/each}
    </div>
  </div>
</div>

{#if showCenter}
  <div
    class="absolute w-2 h-2 bg-danger/80 rounded-full z-[1] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
  />
{/if}
