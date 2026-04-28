<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { MonthCell, MonthPropsWithoutHTML } from './Month.shared.svelte.js';

  export type MonthBaseLayerComponents = {
    Rect: Component<any>;
    Group: Component<any>;
    Text: Component<any>;
  };

  export type MonthBaseProps = MonthPropsWithoutHTML & MonthBaseLayerComponents;
</script>

<script lang="ts">
  import { timeDays, timeWeek } from 'd3-time';
  import { index } from 'd3-array';
  import { format } from '@layerstack/utils';

  import { chartDataArray } from '$lib/utils/common.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  const DAYS_PER_WEEK = 7;

  let {
    Rect,
    Group,
    Text,
    start,
    end,
    cellSize = 25,
    monthsPerRow: monthsPerRowProp,
    monthPadding = 1.2,
    rowSpacing = 8,
    showDayNumber = true,
    monthLabel = true,
    dayNumberProps = {},
    tooltip,
    children,
    ...restProps
  }: MonthBaseProps = $props();

  const ctx = getChartContext();

  const rangeDays = $derived(timeDays(start, end));
  const monthLabelHeight = $derived(monthLabel ? cellSize : 0);

  const monthsPerRow = $derived(
    monthsPerRowProp ??
      Math.floor(
        (ctx.width + (monthPadding - 1) * cellSize * DAYS_PER_WEEK) /
          (monthPadding * cellSize * DAYS_PER_WEEK)
      )
  );

  const dataByDate = $derived(
    ctx.data && ctx.config.x ? index(chartDataArray(ctx.data), (d) => ctx.x(d)) : new Map()
  );

  const allCells = $derived.by(() => {
    const cells: MonthCell[] = [];
    const monthIndexMap = new Map<string, number>();
    let currentMonthIndex = 0;

    rangeDays.forEach((day) => {
      const firstDayOfMonth = new Date(day.getFullYear(), day.getMonth(), 1);
      const monthKey = `${day.getFullYear()}-${day.getMonth()}`;

      if (!monthIndexMap.has(monthKey)) {
        monthIndexMap.set(monthKey, currentMonthIndex);
        currentMonthIndex++;
      }

      const monthIndex = monthIndexMap.get(monthKey)!;
      const cellData = dataByDate.get(day) ?? { date: day };

      const monthCol = monthIndex % monthsPerRow;
      const monthRow = Math.floor(monthIndex / monthsPerRow);

      const monthPaddingOffset = monthPadding * cellSize * DAYS_PER_WEEK * monthCol;
      const weekDiff = timeWeek.count(firstDayOfMonth, day);

      cells.push({
        x: day.getDay() * cellSize + monthPaddingOffset,
        y: weekDiff * cellSize + monthRow * cellSize * rowSpacing + monthLabelHeight,
        color: ctx.config.c ? ctx.cGet(cellData) : 'transparent',
        data: cellData,
        date: day,
      });
    });

    return { cells, monthIndexMap };
  });

  const monthLabels = $derived.by(() => {
    const labels: Array<{ x: number; y: number; text: string }> = [];
    const monthIndexMap = allCells.monthIndexMap;

    const monthEntries = Array.from(monthIndexMap.entries()).sort((a, b) => a[1] - b[1]);

    monthEntries.forEach(([monthKey, idx]) => {
      const [year, month] = monthKey.split('-').map(Number);
      const firstDayOfMonth = new Date(year, month, 1);

      const monthCol = idx % monthsPerRow;
      const monthRow = Math.floor(idx / monthsPerRow);

      const monthPaddingOffset = monthPadding * cellSize * DAYS_PER_WEEK * monthCol;

      labels.push({
        x: monthPaddingOffset,
        y: monthRow * cellSize * rowSpacing,
        text: format(firstDayOfMonth, 'month'),
      });
    });

    return labels;
  });
</script>

<Group>
  {#if children}
    {@render children({ cells: allCells.cells, cellSize })}
  {:else}
    {#each allCells.cells as cell}
      <Rect
        x={cell.x}
        y={cell.y}
        width={cellSize}
        height={cellSize}
        fill={cell.color}
        onpointermove={(e: PointerEvent) => tooltip && ctx.tooltip?.show(e, cell.data)}
        onpointerleave={() => tooltip && ctx.tooltip?.hide()}
        {...extractLayerProps(restProps, 'lc-month-cell')}
      />

      {#if showDayNumber}
        <Text
          x={cell.x + cellSize / 2}
          y={cell.y + cellSize / 2}
          lineHeight="0.8em"
          value={cell.date.getDate()}
          textAnchor="middle"
          verticalAnchor="middle"
          class="lc-month-day-number"
          {...dayNumberProps}
        />
      {/if}
    {/each}
  {/if}

  {#if monthLabel}
    {#each monthLabels as label}
      <Text
        x={label.x}
        y={label.y}
        value={label.text}
        verticalAnchor="start"
        class="lc-month-month-label"
        {...extractLayerProps(monthLabel, 'lc-month-month-label')}
      />
    {/each}
  {/if}
</Group>

<style>
  @layer components {
    :global(:where(.lc-month-cell)) {
      stroke-width: 1;
      --stroke-color: color-mix(
        in oklab,
        var(--color-surface-content, currentColor) 20%,
        transparent
      );
    }

    :global(:where(.lc-month-day-number)) {
      font-size: 10px;
      pointer-events: none;
      stroke: var(--color-surface-100, light-dark(white, black));
      stroke-width: 1px;
      font-weight: 600;
    }

    :global(:where(.lc-month-month-label)) {
      font-size: 16px;
    }
  }
</style>
