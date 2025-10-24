<script lang="ts" module>
  export type MonthCell = {
    x: number;
    y: number;
    color: any;
    data: any;
    date: Date;
  };

  export type MonthPropsWithoutHTML = {
    /**
     * The start date of the calendar.
     */
    start: Date;

    /**
     * The end date of the calendar.
     */
    end: Date;

    /**
     * Size of the cell in the calendar.
     *
     * @default 25
     */
    cellSize?: number;

    /**
     * Number of months to display per row. If undefined, automatically calculated based on available width.
     */
    monthsPerRow?: number;

    /**
     * Padding multiplier between months (relative to cellSize).
     *
     * @default 1.2
     */
    monthPadding?: number;

    /**
     * Vertical spacing multiplier between month rows (in number of cell heights).
     *
     * @default 8
     */
    rowSpacing?: number;

    /**
     * Whether to show the day number in each cell.
     *
     * @default true
     */
    showDayNumber?: boolean;

    /**
     * Props to pass to the `<text>` element for month labels.
     */
    monthLabel?: boolean | Partial<ComponentProps<typeof Text>>;

    /**
     * Props to pass to the `<text>` element for day numbers.
     */
    dayNumberProps?: Partial<ComponentProps<typeof Text>>;

    /**
     * Tooltip context to setup mouse events to show tooltip for related data
     */
    tooltipContext?: TooltipContextValue;

    children?: Snippet<[{ cells: MonthCell[]; cellSize: number }]>;
  } & Omit<
    RectPropsWithoutHTML,
    'children' | 'x' | 'y' | 'width' | 'height' | 'fill' | 'onpointermove' | 'onpointerleave'
  >;

  export type MonthProps = MonthPropsWithoutHTML &
    Without<SVGAttributes<SVGRectElement>, MonthPropsWithoutHTML>;
</script>

<script lang="ts">
  import { type ComponentProps, type Snippet } from 'svelte';
  import { timeDays, timeMonths, timeWeek } from 'd3-time';
  import { index } from 'd3-array';
  import { format } from '@layerstack/utils';

  import Rect, { type RectPropsWithoutHTML } from './Rect.svelte';
  import type { TooltipContextValue } from './tooltip/TooltipContext.svelte';
  import Group from './Group.svelte';
  import Text from './Text.svelte';
  import { chartDataArray } from '../utils/common.js';
  import { getChartContext } from './Chart.svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import type { Without } from '$lib/utils/types.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  const DAYS_PER_WEEK = 7;

  let {
    start,
    end,
    cellSize = 25,
    monthsPerRow: monthsPerRowProp,
    monthPadding = 1.2,
    rowSpacing = 8,
    showDayNumber = true,
    monthLabel = true,
    dayNumberProps = {},
    tooltipContext: tooltip,
    children,
    ...restProps
  }: MonthPropsWithoutHTML = $props();

  const ctx = getChartContext();

  const rangeDays = $derived(timeDays(start, end));

  // Space needed for month labels at the top
  const monthLabelHeight = $derived(cellSize);

  // Calculate monthsPerRow based on the actual space taken by each month
  // Each month (except the last in a row) takes: (monthPadding * cellSize * DAYS_PER_WEEK)
  // The calculation accounts for n-1 padded months plus one unpadded month
  // Formula: (n-1) * monthPadding * width + width = totalWidth
  // Solving for n: n = (totalWidth + (monthPadding - 1) * width) / (monthPadding * width)
  const monthsPerRow = $derived(
    monthsPerRowProp ??
      Math.floor(
        (ctx.width + (monthPadding - 1) * cellSize * DAYS_PER_WEEK) /
          (monthPadding * cellSize * DAYS_PER_WEEK)
      )
  );

  // Generate data indexed by date (using date object as key)
  const dataByDate = $derived(
    ctx.data && ctx.config.x ? index(chartDataArray(ctx.data), (d) => ctx.x(d)) : new Map()
  );

  // Generate cells for the date range
  const allCells = $derived.by(() => {
    const cells: MonthCell[] = [];
    // Create a map of month index to track which months we've seen
    const monthIndexMap = new Map<string, number>();
    let currentMonthIndex = 0;

    rangeDays.forEach((day) => {
      const firstDayOfMonth = new Date(day.getFullYear(), day.getMonth(), 1);
      const monthKey = `${day.getFullYear()}-${day.getMonth()}`;

      // Assign a sequential index to each unique month in the range
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

  // Generate month labels based on the actual months encountered in the cells
  const monthLabels = $derived.by(() => {
    const labels: Array<{ x: number; y: number; text: string }> = [];
    const monthIndexMap = allCells.monthIndexMap;

    // Convert the map to an array of [monthKey, index] pairs and sort by index
    const monthEntries = Array.from(monthIndexMap.entries()).sort((a, b) => a[1] - b[1]);

    monthEntries.forEach(([monthKey, index]) => {
      // Parse the monthKey to get the year and month
      const [year, month] = monthKey.split('-').map(Number);
      const firstDayOfMonth = new Date(year, month, 1);

      const monthCol = index % monthsPerRow;
      const monthRow = Math.floor(index / monthsPerRow);

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
  <!-- Cells -->
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
        onpointermove={(e) => tooltip?.show(e, cell.data)}
        onpointerleave={(e) => tooltip?.hide()}
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

  <!-- Month labels -->
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
