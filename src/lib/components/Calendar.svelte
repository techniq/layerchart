<script lang="ts">
  import { getContext, type ComponentProps } from 'svelte';
  import { timeDays, timeMonths, timeWeek, timeYear } from 'd3-time';

  import Rect from './Rect.svelte';
  import type { TooltipContextValue } from './TooltipContext.svelte';
  import MonthPath from './MonthPath.svelte';
  import { index } from 'd3-array';

  export let start: Date;
  export let end: Date;

  /**
   * Size of cell.  If `number`, sets width/height as same value (square).  If array, sets as [width,height].  If undefined, is derived from Chart width/height
   */
  export let cellSize: number | [number, number] | undefined = undefined;

  /** Enable drawing path around each month.  If object, pass as props to underlying <path> */
  export let monthPath: boolean | ComponentProps<MonthPath> = false;

  /**
   * Tooltip context to setup mouse events to show tooltip for related data
   */
  export let tooltip: TooltipContextValue | undefined = undefined;

  const { width, height, x, rGet, data, config } = getContext('LayerCake');

  $: yearDays = timeDays(start, end);
  $: yearMonths = timeMonths(start, end);
  $: yearWeeks = timeWeek.count(start, end);

  $: chartCellWidth = $width / (yearWeeks + 1);
  $: chartCellHeight = $height / 7;
  $: chartCellSize = Math.min(chartCellWidth, chartCellHeight); // Use smallest to fit, and keep square aspect

  $: [cellWidth, cellHeight] = Array.isArray(cellSize)
    ? cellSize
    : typeof cellSize === 'number'
    ? [cellSize, cellSize]
    : [chartCellSize, chartCellSize];

  $: dataByDate = data && $config.x ? index($data, (d) => $x(d)) : new Map();

  $: cells = yearDays.map((date) => {
    const cellData = dataByDate.get(date) ?? { date };
    return {
      x: timeWeek.count(timeYear(date), date) * cellWidth,
      y: date.getDay() * cellHeight,
      width: cellWidth,
      height: cellHeight,
      color: $config.r ? $rGet(cellData) : 'transparent',
      data: cellData,
    };
  });
</script>

<slot {cells}>
  {#each cells as cell}
    <Rect
      x={cell.x}
      y={cell.y}
      width={cell.width}
      height={cell.height}
      fill={cell.color}
      on:mousemove={(e) => tooltip?.show(e, cell.data)}
      on:mouseleave={(e) => tooltip?.hide()}
      class="stroke-black/5"
      {...$$restProps}
    />
  {/each}
</slot>

{#if monthPath}
  {#each yearMonths as date}
    <MonthPath
      {date}
      cellSize={[cellWidth, cellHeight]}
      {...typeof monthPath === 'object' ? monthPath : null}
    />
  {/each}
{/if}
