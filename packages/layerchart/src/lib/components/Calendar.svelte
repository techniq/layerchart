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
    monthPath?: boolean | Partial<ComponentProps<MonthPath>>;

    /**
     * Tooltip context to setup mouse events to show tooltip for related data
     */
    tooltipContext?: TooltipContextValue;

    children?: Snippet<[{ cells: CalendarCell[] }]>;
  } & Omit<
    RectPropsWithoutHTML,
    'children' | 'x' | 'y' | 'width' | 'height' | 'fill' | 'onpointermove' | 'onpointerleave'
  >;

  export type CalendarProps = CalendarPropsWithoutHTML &
    Without<SVGAttributes<SVGRectElement>, CalendarPropsWithoutHTML>;
</script>

<script lang="ts">
  import { type ComponentProps, type Snippet } from 'svelte';
  import { timeDays, timeMonths, timeWeek, timeYear } from 'd3-time';
  import { index } from 'd3-array';
  import { format } from 'date-fns';

  import Rect, { type RectPropsWithoutHTML } from './Rect.svelte';
  import type { TooltipContextValue } from './tooltip/TooltipContext.svelte';
  import MonthPath from './MonthPath.svelte';
  import Text from './Text.svelte';
  import { chartDataArray } from '../utils/common.js';
  import { getChartContext } from './Chart-Next.svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import type { Without } from 'layerchart/utils/types.js';

  let {
    end,
    start,
    cellSize: cellSizeProp,
    monthPath = false,
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
  const cellSize = $derived(
    Array.isArray(cellSizeProp)
      ? cellSizeProp
      : typeof cellSizeProp === 'number'
        ? [cellSizeProp, cellSizeProp]
        : [chartCellSize, chartCellSize]
  ) as [number, number];

  const dataByDate = $derived(
    ctx.data && ctx.config.x ? index(chartDataArray(ctx.data), (d) => ctx.x(d)) : new Map()
  );

  const cells = $derived(
    yearDays.map((date) => {
      const cellData = dataByDate.get(date) ?? { date };
      return {
        x: timeWeek.count(timeYear(date), date) * cellSize[0],
        y: date.getDay() * cellSize[1],
        color: ctx.config.c ? ctx.cGet(cellData) : 'transparent',
        data: cellData,
      };
    })
  ) satisfies CalendarCell[];
</script>

{#if children}
  {@render children({ cells })}
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
      class="stroke-surface-content/5"
      {...restProps}
    />
  {/each}
{/if}

{#if monthPath}
  {#each yearMonths as date}
    <MonthPath {date} {cellSize} {...typeof monthPath === 'object' ? monthPath : null} />

    <Text
      x={timeWeek.count(timeYear.floor(date), timeWeek.ceil(date)) * cellSize[0]}
      y={-4}
      value={format(date, 'MMM')}
      class="text-xs"
    />
  {/each}
{/if}
