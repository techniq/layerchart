<script lang="ts" module>
  export type CalendarCell = {
    x: number;
    y: number;
    color: any;
    data: any;
  };

  export type CalendarPropsWithoutHTML = {
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
     * - `number`: sets width/height as same value (square).
     * - `array`: sets as [width,height].
     * - `undefined/omitted`: is derived from Chart width/height
     */
    cellSize?: number | [number, number];

    /**
     * Enable drawing path around each month.  If object, pass as props to underlying <path>
     *
     * @default false
     */
    monthPath?: boolean | Partial<ComponentProps<typeof MonthPath>>;

    /**
     * Props to pass to the `<text>` element for month labels.
     */
    monthLabel?: boolean | Partial<ComponentProps<typeof Text>>;

    /**
     * Tooltip context to setup mouse events to show tooltip for related data
     */
    tooltipContext?: TooltipContextValue;

    children?: Snippet<[{ cells: CalendarCell[]; cellSize: [number, number] }]>;
  } & Omit<
    RectPropsWithoutHTML,
    'children' | 'x' | 'y' | 'width' | 'height' | 'fill' | 'onpointermove' | 'onpointerleave'
  >;

  export type CalendarProps = CalendarPropsWithoutHTML &
    Without<SVGAttributes<SVGRectElement>, CalendarPropsWithoutHTML>;
</script>

<script lang="ts">
  import { type ComponentProps, type Snippet } from 'svelte';
  import { timeDays, timeMonths, timeWeek } from 'd3-time';
  import { index } from 'd3-array';
  import { format } from '@layerstack/utils';

  import Rect, { type RectPropsWithoutHTML } from './Rect.svelte';
  import type { TooltipContextValue } from './tooltip/TooltipContext.svelte';
  import MonthPath from './MonthPath.svelte';
  import Text from './Text.svelte';
  import { chartDataArray } from '../utils/common.js';
  import { getChartContext } from './Chart.svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import type { Without } from '$lib/utils/types.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  let {
    end,
    start,
    cellSize: cellSizeProp,
    monthPath = false,
    monthLabel = true,
    tooltipContext: tooltip,
    children,
    ...restProps
  }: CalendarPropsWithoutHTML = $props();

  const ctx = getChartContext();

  const yearDays = $derived(timeDays(start, end));
  const yearMonths = $derived(timeMonths(start, end));
  const yearWeeks = $derived(timeWeek.count(start, end));
  const chartCellWidth = $derived(ctx.width / (yearWeeks + 1));
  const chartCellHeight = $derived(ctx.height / 7);
  // Use smallest to fit, and keep square aspect
  const chartCellSize = $derived(Math.min(chartCellWidth, chartCellHeight));

  // [width, height]
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
      onpointermove={(e) => tooltip?.show(e, cell.data)}
      onpointerleave={(e) => tooltip?.hide()}
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
