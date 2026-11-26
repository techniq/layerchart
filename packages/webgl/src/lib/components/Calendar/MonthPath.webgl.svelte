<!-- A month's outline on a `Calendar`, as LayerChart's `MonthPath` draws it, with a WebGL `Path` -->
<script lang="ts">
  import { endOfInterval } from '@layerstack/utils';
  import Path from '../Path/Path.webgl.svelte';

  let {
    date,
    cellSize: cellSizeProp,
    startOfRange,
    class: className,
    ...rest
  }: {
    date: Date;
    cellSize: number | [number, number];
    startOfRange: Date;
    class?: string;
    [key: string]: any;
  } = $props();

  /** Sundays from `from`'s week to `to`'s, as d3's `timeWeek.count` (by local calendar days) */
  function weeksBetween(from: Date, to: Date) {
    const days = Math.round(
      (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
        Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) /
        864e5
    );
    return Math.floor((days + from.getDay()) / 7);
  }

  const cellSize = $derived(
    Array.isArray(cellSizeProp) ? cellSizeProp : [cellSizeProp, cellSizeProp]
  );
  const startDayOfWeek = $derived(date.getDay());
  const startWeek = $derived(weeksBetween(startOfRange, date));
  const monthEnd = $derived(endOfInterval('month', date));
  const endDayOfWeek = $derived(monthEnd.getDay());
  const endWeek = $derived(weeksBetween(startOfRange, monthEnd));

  const pathData = $derived(
    `M${(startWeek + 1) * cellSize[0]},${startDayOfWeek * cellSize[1]}` +
      `H${startWeek * cellSize[0]} V${cellSize[1] * 7}` +
      `H${endWeek * cellSize[0]} V${(endDayOfWeek + 1) * cellSize[1]}` +
      `H${(endWeek + 1) * cellSize[0]} V0` +
      `H${(startWeek + 1) * cellSize[0]}Z`
  );
</script>

<Path
  {pathData}
  fill="none"
  class={['lc-month-path', className].filter(Boolean).join(' ')}
  stroke={rest.stroke}
  strokeWidth={rest.strokeWidth}
  opacity={rest.opacity}
/>
