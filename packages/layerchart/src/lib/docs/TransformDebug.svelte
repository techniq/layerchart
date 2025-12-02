<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { format } from '@layerstack/utils';

  import { getChartContext } from '$lib/contexts/chart.js';

  const ctx = getChartContext();
</script>

<div
  class={cls('bg-surface-300/50 rounded-sm m-1 backdrop-blur-sm p-2 tabular-nums', $$props.class)}
>
  <div class="grid gap-2 text-xs">
    <div><span class="opacity-50">scale:</span> {format(ctx.transform.scale, 'decimal')}</div>

    <div>
      <span class="opacity-50">translate:</span>
      <div class="text-right">{format(ctx.transform.translate.x, 'decimal')}</div>
      <div class="text-right">{format(ctx.transform.translate.y, 'decimal')}</div>
    </div>
  </div>
</div>
