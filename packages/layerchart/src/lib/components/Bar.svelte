<script lang="ts">
  import { getContext, type ComponentProps } from 'svelte';

  import { createDimensionGetter } from '$lib/utils/rect';
  import Rect from './Rect.svelte';

  const { x: xContext, y: yContext } = getContext('LayerCake');

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

  export let inset = 0;
  export let groupBy: string | undefined = undefined;
  export let groupPaddingInner = 0.2;
  export let groupPaddingOuter = 0;

  export let spring: ComponentProps<Rect>['spring'] = undefined;
  export let tweened: ComponentProps<Rect>['tweened'] = undefined;

  $: if (stroke === null || stroke === undefined) stroke = 'black';

  $: getDimensions = createDimensionGetter(getContext('LayerCake'), {
    x,
    y,
    groupBy,
    inset,
    groupPadding: {
      inner: groupPaddingInner,
      outer: groupPaddingOuter,
    },
  });
</script>

<Rect
  {fill}
  {spring}
  {tweened}
  {stroke}
  stroke-width={strokeWidth}
  rx={radius}
  {...$getDimensions(bar)}
  {...$$restProps}
  on:click
/>
