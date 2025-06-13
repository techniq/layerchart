<script lang="ts" module>
  import type { Without } from '$lib/utils/types.js';
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
    pathRef?: SVGPathElement;
  };

  export type MonthPathProps = MonthPathPropsWithoutHTML &
    // we omit the spline props to avoid conflicts with attribute names since we are
    // passing them through to `<Spline />`
    Without<SVGAttributes<SVGPathElement>, MonthPathPropsWithoutHTML & SplinePropsWithoutHTML>;
</script>

<script lang="ts">
  import { timeWeek, timeMonth, timeYear } from 'd3-time';
  import { cls } from '@layerstack/tailwind';
  import { endOfInterval } from '@layerstack/utils';
  import { layerClass } from '$lib/utils/attributes.js';
  import Spline, { type SplinePropsWithoutHTML } from './Spline.svelte';

  let {
    date,
    cellSize: cellSizeProp,
    pathRef: pathRefProp = $bindable(),
    class: className,
    ...restProps
  }: MonthPathProps = $props();

  let pathRef = $state<SVGPathElement>();
  $effect.pre(() => {
    pathRefProp = pathRef;
  });

  const cellSize = $derived(
    Array.isArray(cellSizeProp) ? cellSizeProp : [cellSizeProp, cellSizeProp]
  );

  // start of month
  const startDayOfWeek = $derived(date.getDay());
  const startWeek = $derived(timeWeek.count(timeYear(date), date));

  // end of month
  const monthEnd = $derived(endOfInterval('month', date));
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

<Spline
  bind:pathRef
  {pathData}
  fill="none"
  class={cls(layerClass('month-path'), 'stroke-surface-content/20', className)}
  {...restProps}
/>
