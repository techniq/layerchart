<script lang="ts">
  // Shared tooltip logic across simplified chart components
  import { sum } from 'd3-array';
  import { getChartContext } from '$lib/contexts/chart.js';
  import * as Tooltip from '../tooltip/index.js';
  import type { SimplifiedChartPropsObject } from './types.js';
  import { format } from '@layerstack/utils';
  import { accessor, findRelatedData } from '$lib/utils/common.js';

  let {
    tooltipProps,
    canHaveTotal = false,
  }: {
    tooltipProps?: SimplifiedChartPropsObject['tooltip'];
    canHaveTotal?: boolean;
  } = $props();

  const context = getChartContext();
</script>

<Tooltip.Root {context} {...tooltipProps?.root}>
  {#snippet children({ data, payload })}
    <Tooltip.Header value={payload[0].label} {format} {...tooltipProps?.header} />

    <Tooltip.List {...tooltipProps?.list}>
      <!-- Reverse series order so tooltip items match stacks -->
      {#each payload as p, i (p.key ?? i)}
        <Tooltip.Item
          label={p.name}
          value={p.value}
          color={p.color}
          {format}
          valueAlign="right"
          onpointerenter={() => (context.seriesState.highlightKey = p.key)}
          onpointerleave={() => (context.seriesState.highlightKey = null)}
          {...tooltipProps?.item}
        />
      {/each}

      {#if canHaveTotal && payload.length > 1 && !tooltipProps?.hideTotal}
        <Tooltip.Separator {...tooltipProps?.separator} children={undefined} />

        <Tooltip.Item
          label="total"
          value={sum(context.seriesState.visibleSeries, (s) => {
            const seriesTooltipData = s.data ? findRelatedData(s.data, data, context.x) : data;
            const valueAccessor = accessor(s.value ?? (s.data ? context.y : s.key));
            return seriesTooltipData ? valueAccessor(seriesTooltipData) : 0;
          })}
          format="integer"
          valueAlign="right"
          {...tooltipProps?.item}
        />
      {/if}
    </Tooltip.List>
  {/snippet}
</Tooltip.Root>
