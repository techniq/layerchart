<script lang="ts" module>
  import type { Without } from 'layerchart/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';

  export type MonthPathPropsWithoutHTML = {
    /**
     * The date to use for the month path.
     */
    date: Date;

    /**
     * Size of cell.
     * - `number` - sets width/height as same.
     * - array - sets [width, height].
     */
    cellSize: number | [number, number];

    /**
     * A bindable reference to the underlying `<path>` element.
     *
     * @bindable
     */
    ref?: SVGPathElement;
  };

  export type MonthPathProps = MonthPathPropsWithoutHTML &
    Without<SVGAttributes<SVGPathElement>, MonthPathPropsWithoutHTML>;
</script>

<script lang="ts">
  import { timeWeek, timeYear } from 'd3-time';
  import { endOfMonth } from 'date-fns';

  let { date, cellSize: cellSizeProp, ref = $bindable(), ...restProps }: MonthPathProps = $props();

  const cellSize = $derived(
    Array.isArray(cellSizeProp) ? cellSizeProp : [cellSizeProp, cellSizeProp]
  );

  // start of month
  const startDayOfWeek = $derived(date.getDay());
  const startWeek = $derived(timeWeek.count(timeYear(date), date));

  // end of month
  const monthEnd = $derived(endOfMonth(date));
  const endDayOfWeek = $derived(monthEnd.getDay());
  const endWeek = $derived(timeWeek.count(timeYear(monthEnd), monthEnd));

  const pathData = $derived(`
    M${(startWeek + 1) * cellSize[0]},${startDayOfWeek * cellSize[1]}
    H${startWeek * cellSize[0]} V${cellSize[1] * 7}
    H${endWeek * cellSize[0]} V${(endDayOfWeek + 1) * cellSize[1]}
    H${(endWeek + 1) * cellSize[0]} V0
    H${(startWeek + 1) * cellSize[0]}Z
  `);
</script>

<path bind:this={ref} d={pathData} fill="none" class="stroke-surface-content/20" {...restProps} />
