<script lang="ts" module>
  import type { RectProps } from './Rect.svelte';
  import type { DataProp } from '$lib/utils/dataProp.js';

  type BaseRectCellProps = Omit<
    RectProps,
    | 'width'
    | 'height'
    | 'x0'
    | 'x1'
    | 'y0'
    | 'y1'
    | 'initialX'
    | 'initialY'
    | 'initialWidth'
    | 'initialHeight'
    | 'motion'
    | 'ref'
  >;

  export type CellProps = BaseRectCellProps & {
    /**
     * Shape to render for each cell.
     * - `'rect'`: renders a rectangle filling the band (default)
     * - `'circle'`: renders a circle centered within the band cell
     *
     * @default 'rect'
     */
    shape?: 'rect' | 'circle';

    /**
     * Radius for circle shape.
     * - `number`: direct pixel value
     * - `string`: data property name, resolved via rScale
     * - `function(d)`: accessor called per data item, result passed through rScale
     *
     * When not provided, defaults to half the minimum of cell width and height.
     */
    r?: DataProp;
  };
</script>

<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';
  import { isScaleBand } from '$lib/utils/scales.svelte.js';
  import Rect from './Rect.svelte';
  import Circle from './Circle.svelte';
  import Group from './Group.svelte';

  let { shape = 'rect', r, x, y, ...restProps }: CellProps = $props();

  const chartCtx = getChartContext();
  const cellWidth = $derived(isScaleBand(chartCtx.xScale) ? chartCtx.xScale.bandwidth() : 0);
  const cellHeight = $derived(isScaleBand(chartCtx.yScale) ? chartCtx.yScale.bandwidth() : 0);
  const defaultR = $derived(Math.min(cellWidth, cellHeight) / 2);
</script>

{#if shape === 'circle'}
  <Group x={cellWidth / 2} y={cellHeight / 2}>
    <Circle cx={x} cy={y} r={r ?? defaultR} {...restProps as any} />
  </Group>
{:else}
  <Rect width={cellWidth} height={cellHeight} {x} {y} {...restProps} />
{/if}
