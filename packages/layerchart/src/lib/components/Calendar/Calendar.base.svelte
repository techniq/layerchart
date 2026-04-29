<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { CalendarCell, CalendarPropsWithoutHTML } from './Calendar.shared.svelte.js';

  export type CalendarBaseLayerComponents = {
    Rect: Component<any>;
    Text: Component<any>;
  };

  export type CalendarBaseProps = CalendarPropsWithoutHTML & CalendarBaseLayerComponents;
</script>

<script lang="ts">
  import { timeDays, timeMonths, timeWeek } from 'd3-time';
  import { index } from 'd3-array';
  import { format } from '@layerstack/utils';

  // MonthPath isn't split — only used here when `monthPath` is set.
  import MonthPath from '../MonthPath.svelte';
  import { chartDataArray } from '$lib/utils/common.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  let {
    Rect,
    Text,
    end,
    start,
    cellSize: cellSizeProp,
    monthPath = false,
    monthLabel = true,
    tooltip,
    children,
    ...restProps
  }: CalendarBaseProps = $props();

  const ctx = getChartContext();

  const yearDays = $derived(timeDays(start, end));
  const yearMonths = $derived(timeMonths(start, end));
  const yearWeeks = $derived(timeWeek.count(start, end));
  const chartCellWidth = $derived(ctx.width / (yearWeeks + 1));
  const chartCellHeight = $derived(ctx.height / 7);
  const chartCellSize = $derived(Math.min(chartCellWidth, chartCellHeight));

  const cellSize: [number, number] = $derived(
    Array.isArray(cellSizeProp)
      ? cellSizeProp
      : typeof cellSizeProp === 'number'
        ? [cellSizeProp, cellSizeProp]
        : [chartCellSize, chartCellSize]
  );

  const dataByDate = $derived(
    ctx.data && ctx.config.x ? index(chartDataArray(ctx.data), (d) => ctx.x(d)) : new Map()
  );

  const cells = $derived(
    yearDays.map((date) => {
      const cellData = dataByDate.get(date) ?? { date };
      return {
        x: timeWeek.count(start, date) * cellSize[0],
        y: date.getDay() * cellSize[1],
        color: ctx.config.c ? ctx.cGet(cellData) : 'transparent',
        data: cellData,
      };
    })
  ) satisfies CalendarCell[];
</script>

{#if children}
  {@render children({ cells, cellSize })}
{:else}
  {#each cells as cell}
    <Rect
      x={cell.x}
      y={cell.y}
      width={cellSize[0]}
      height={cellSize[1]}
      fill={cell.color}
      onpointermove={(e: PointerEvent) => tooltip && ctx.tooltip?.show(e, cell.data)}
      onpointerleave={() => tooltip && ctx.tooltip?.hide()}
      strokeWidth={1}
      {...extractLayerProps(restProps, 'lc-calendar-cell')}
    />
  {/each}
{/if}

{#if monthPath}
  {#each yearMonths as date}
    <MonthPath
      {date}
      startOfRange={start}
      {cellSize}
      {...extractLayerProps(monthPath, 'lc-calendar-month-path')}
    />
  {/each}
{/if}

{#if monthLabel}
  {#each yearMonths as date}
    <Text
      x={timeWeek.count(start, timeWeek.ceil(date)) * cellSize[0]}
      value={format(date, 'month', { variant: 'short' })}
      capHeight="7px"
      {...extractLayerProps(monthLabel, 'lc-calendar-month-label')}
    />
  {/each}
{/if}

<style>
  @layer components {
    :global(:where(.lc-calendar-cell)) {
      --stroke-color: color-mix(
        in oklab,
        var(--color-surface-content, currentColor) 5%,
        transparent
      );
    }

    :global(:where(.lc-calendar-month-label)) {
      font-size: 12px;
    }
  }
</style>
