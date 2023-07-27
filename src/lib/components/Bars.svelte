<script lang="ts">
  import { getContext } from 'svelte';
  import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';

  import Rect from './Rect.svelte';
  import { createDimensionGetter } from '$lib/utils/rect';

  const { data, xScale, x: xContext, y: yContext, rGet, config } = getContext('LayerCake');

  /**
   * Override `x` from context.  Useful for multiple Bar instances
   */
  export let x = $xContext;
  // Convert x to function
  $: _x = x ? (typeof x === 'string' ? (d) => d[x] : x) : $xContext;

  /**
   * Override `y` from context.  Useful for multiple Bar instances
   */
  export let y = $yContext;
  $: _y = y ? (typeof y === 'string' ? (d) => d[y] : y) : $yContext;

  export let stroke = 'black';
  export let strokeWidth = 0;
  export let radius = 0;
  export let getKey: (item: any, index: number) => any = (item) =>
    $xScale.bandwidth ? _x(item) : _y(item);
  export let getProps: ((obj: { value: any; item: any; index: number }) => any) | undefined =
    undefined;
  /** Inset the rect for amount of padding.  Useful with multiple bars (bullet, overlap, etc) */
  export let padding = 0;

  export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

  // See: https://svelte.dev/repl/7000c5ce05b84cd98ccbfb2768b4be3d?version=3.38.3

  export let groupBy: string | undefined = undefined;
  export let groupPaddingInner = 0.2;
  export let groupPaddingOuter = 0;

  $: getDimensions = createDimensionGetter(getContext('LayerCake'), {
    x,
    y,
    groupBy,
    padding,
    groupPadding: {
      inner: groupPaddingInner,
      outer: groupPaddingOuter,
    },
  });
</script>

<g class="Bars">
  {#each $data as item, index (getKey(item, index))}
    <Rect
      data-id={index}
      fill={$config.r ? $rGet(item) : null}
      {stroke}
      stroke-width={strokeWidth}
      rx={radius}
      {spring}
      {tweened}
      {...$getDimensions(item)}
      {...getProps?.({ value: _y(item), item, index })}
      {...$$restProps}
    />
  {/each}
</g>
