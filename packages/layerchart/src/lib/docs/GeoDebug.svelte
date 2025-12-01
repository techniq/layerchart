<script lang="ts">
  import { Checkbox } from 'svelte-ux';
  import { cls } from '@layerstack/tailwind';
  import { format } from '@layerstack/utils';
  import { getChartContext } from '$lib/contexts/chart.js';
  import type { HTMLAttributes } from 'svelte/elements';

  const ctx = getChartContext();

  let { class: className }: HTMLAttributes<HTMLElement> = $props();

  let showCenter = $state(false);
</script>

{#if ctx.geo.projection}
  <div class={cls('bg-surface-300/50 rounded-sm m-1 backdrop-blur-sm p-2 tabular-nums', className)}>
    <div class="grid gap-2 text-xs">
      <div>
        <span class="opacity-50">scale:</span>
        {format(ctx.geo.projection.scale(), 'decimal')}
      </div>

      <div>
        <span class="opacity-50">translate:</span>
        {#each ctx.geo.projection.translate() as coord}
          <div class="text-right">{format(coord, 'decimal')}</div>
        {/each}
      </div>

      <div>
        <span class="opacity-50">rotate:</span>
        {#each ctx.geo.projection.rotate() as angle}
          <div class="text-right">{format(angle, 'decimal')}</div>
        {/each}
      </div>

      <div class="grid grid-cols-[auto_1fr]">
        <span class="opacity-50">center:</span>
        <span class="text-right">
          {ctx.geo.projection.center?.()}
        </span>
      </div>

      <div>
        <span class="opacity-50">long/lat: <Checkbox bind:checked={showCenter} size="xs" /></span>
        {#each ctx.geo.projection.invert?.([ctx.width / 2, ctx.height / 2]) ?? [] as coord}
          <div class="text-right">{format(coord, 'decimal')}</div>
        {/each}
      </div>
    </div>
  </div>

  {#if showCenter}
    <div
      class="absolute w-2 h-2 bg-danger/80 rounded-full z-1 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    ></div>
  {/if}
{/if}
