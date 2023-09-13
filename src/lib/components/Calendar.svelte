<script lang="ts">
  import { getContext } from 'svelte';
  import { timeDays, timeMonths, timeWeek, timeYear } from 'd3-time';

  import Rect from './Rect.svelte';
  import type { TooltipContextValue } from './TooltipContext.svelte';
  import MonthPath from './MonthPath.svelte';
  import { index } from 'd3-array';

  export let start: Date;
  export let end: Date;

  /**
   * Size of cell.  If `number`, sets width/height as same value (square).  If array, sets as [width,height].  If undefined, is based on Chart width/height
   */
  export let cellSize: number | [number, number] | undefined = undefined;

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
</script>

{#each yearDays as date}
  {@const data = dataByDate.get(date) ?? { date }}
  <Rect
    fill={$config.r ? $rGet(data) : 'transparent'}
    stroke="#ddd"
    width={cellWidth}
    height={cellHeight}
    x={timeWeek.count(timeYear(date), date) * cellWidth}
    y={date.getDay() * cellHeight}
    on:mousemove={(e) => tooltip?.show(e, data)}
    on:mouseleave={(e) => tooltip?.hide()}
  />
{/each}

{#each yearMonths as date}
  <MonthPath {date} cellSize={[cellWidth, cellHeight]} />
{/each}
