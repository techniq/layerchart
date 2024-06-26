<script lang="ts">
  import { type ComponentProps } from 'svelte';

  import { chartContext } from './ChartContext.svelte';
  import Rect from './Rect.svelte';
  import Spline from './Spline.svelte';

  import { createDimensionGetter } from '$lib/utils/rect.js';

  const { x: xContext, y: yContext } = chartContext();

  export let bar: Object;

  /**
   * Override `x` from context.  Useful for multiple Bar instances
   */
  export let x = $xContext;

  /**
   * Override `y` from context.  Useful for multiple Bar instances
   */
  export let y = $yContext;

  export let fill: string | undefined = undefined;
  export let stroke = 'black';
  export let strokeWidth = 0;
  export let radius = 0;

  /** Control which corners are rounded with radius.  Uses <path> instead of <rect> when not set to `all` */
  export let rounded:
    | 'all'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right' = 'all';

  export let inset = 0;
  export let groupBy: string | undefined = undefined;
  export let groupPaddingInner = 0.2;
  export let groupPaddingOuter = 0;

  export let spring: ComponentProps<Rect>['spring'] = undefined;
  export let tweened: ComponentProps<Rect>['tweened'] = undefined;

  $: if (stroke === null || stroke === undefined) stroke = 'black';

  $: getDimensions = createDimensionGetter(chartContext(), {
    x,
    y,
    groupBy,
    inset,
    groupPadding: {
      inner: groupPaddingInner,
      outer: groupPaddingOuter,
    },
  });
  $: dimensions = $getDimensions(bar) ?? { x: 0, y: 0, width: 0, height: 0 };

  $: topLeft = ['all', 'top', 'left', 'top-left'].includes(rounded);
  $: topRight = ['all', 'top', 'right', 'top-right'].includes(rounded);
  $: bottomLeft = ['all', 'bottom', 'left', 'bottom-left'].includes(rounded);
  $: bottomRight = ['all', 'bottom', 'right', 'bottom-right'].includes(rounded);

  $: width = dimensions.width;
  $: height = dimensions.height;
  $: diameter = 2 * radius;

  $: pathData = `M${dimensions.x + radius},${dimensions.y} h${width - diameter}
      ${topRight ? `a${radius},${radius} 0 0 1 ${radius},${radius}` : `h${radius}v${radius}`}
      v${height - diameter}
      ${bottomRight ? `a${radius},${radius} 0 0 1 ${-radius},${radius}` : `v${radius}h${-radius}`}
      h${diameter - width}
      ${bottomLeft ? `a${radius},${radius} 0 0 1 ${-radius},${-radius}` : `h${-radius}v${-radius}`}
      v${diameter - height}
      ${topLeft ? `a${radius},${radius} 0 0 1 ${radius},${-radius}` : `v${-radius}h${radius}`}
      z`
    .split('\n')
    .join('');
</script>

{#if rounded === 'all'}
  <Rect
    {fill}
    {spring}
    {tweened}
    {stroke}
    stroke-width={strokeWidth}
    rx={radius}
    {...dimensions}
    {...$$restProps}
    on:click
  />
{:else}
  <Spline
    {pathData}
    {fill}
    {spring}
    {tweened}
    {stroke}
    stroke-width={strokeWidth}
    {...$$restProps}
    on:click
  />
{/if}
