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
  import { endOfInterval, format } from '@layerstack/utils';

  // MonthPath isn't split — only used here when `monthPath` is set.
  import MonthPath from '../MonthPath.svelte';
  import {} from '$lib/utils/common.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getMarkData } from '$lib/contexts/facet.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { resolveDataProp } from '$lib/utils/dataProp.js';
  import { getLayerIsometric } from '$lib/contexts/isometric.js';

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
    z,
    ...restProps
  }: CalendarBaseProps = $props();

  const ctx = getChartContext();
  const layerIsometric = getLayerIsometric();
  const markData = getMarkData();

  const yearDays = $derived(timeDays(start, end));
  const yearMonths = $derived(timeMonths(start, end));
  const yearWeeks = $derived(timeWeek.count(start, end));

  // `MonthPath` outlines the whole month, so the last month can extend past `end` when the range
  // stops mid-month (ex. a trailing 90 days). Size cells against the widest thing drawn, otherwise
  // the outline overflows the chart until the container shrinks past the last cell instead.
  const monthPathWeeks = $derived(
    monthPath && yearMonths.length
      ? timeWeek.count(start, endOfInterval('month', yearMonths[yearMonths.length - 1]))
      : 0
  );
  const weekColumns = $derived(Math.max(yearWeeks, monthPathWeeks) + 1);

  const chartCellWidth = $derived(ctx.width / weekColumns);
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
    ctx.data && ctx.config.x ? index(markData(), (d) => ctx.x(d)) : new Map()
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

  /**
   * A day's height off an `isometric` floor, in pixels — from `z`, else the chart's — or none.
   * Its cell stands up to it.
   */
  function cellHeight(cell: CalendarCell) {
    if (Array.isArray(z)) return z;
    if (z != null) return resolveDataProp(z, cell.data, ctx.zScale, 0);
    if (ctx.config.z == null) return undefined;
    return Number(ctx.zGet(cell.data)) || 0;
  }

  // On an isometric floor, back to front, so nearer days cover farther ones.  Unkeyed below, so
  // as the view turns each cell takes its new day
  const paintedCells = $derived.by(() => {
    const m = layerIsometric();
    if (!m) return cells;
    const depth = (cell: CalendarCell) => m.b * cell.x + m.d * cell.y;
    return [...cells].sort((a, b) => depth(a) - depth(b));
  });
</script>

{#if children}
  {@render children({ cells, cellSize })}
{:else}
  {#each paintedCells as cell}
    <Rect
      x={cell.x}
      y={cell.y}
      width={cellSize[0]}
      height={cellSize[1]}
      z={cellHeight(cell)}
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
      verticalAnchor="end"
      dy={-4}
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
