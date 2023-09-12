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

  $: [cellWidth, cellHeight] = Array.isArray(cellSize)
    ? cellSize
    : typeof cellSize === 'number'
    ? [cellSize, cellSize]
    : [$width / (yearWeeks + 1), $height / 7];

  const yearDays = timeDays(start, end);
  const yearMonths = timeMonths(start, end);
  const yearWeeks = timeWeek.count(start, end);

  $: dataByDate = data && $config.x ? index($data, (d) => $x(d)) : new Map();
</script>

{#each yearDays as date}
  {@const data = dataByDate.get(date) ?? { date }}
  {console.log({ data, color: $config.x && $rGet(data) })}
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
