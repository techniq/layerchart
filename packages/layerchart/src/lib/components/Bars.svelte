<script lang="ts">
  import { type ComponentProps } from 'svelte';

  import { chartContext } from './ChartContext.svelte';
  import Bar from './Bar.svelte';
  import Rect from './Rect.svelte';
  import type { Accessor } from '../utils/common.js';

  const { data, rGet, config } = chartContext();

  /**
   * Override `x` from context.  Useful for multiple Bar instances
   */
  export let x: Accessor = undefined;

  /**
   * Override `y` from context.  Useful for multiple Bar instances
   */
  export let y: Accessor = undefined;

  export let stroke = 'black';
  export let strokeWidth = 0;
  export let radius = 0;

  /** Inset the rect for amount of padding.  Useful with multiple bars (bullet, overlap, etc) */
  export let inset = 0;

  export let spring: ComponentProps<Rect>['spring'] = undefined;
  export let tweened: ComponentProps<Rect>['tweened'] = undefined;

  // See: https://svelte.dev/repl/7000c5ce05b84cd98ccbfb2768b4be3d?version=3.38.3

  export let groupBy: string | undefined = undefined;
  export let groupPaddingInner = 0.2;
  export let groupPaddingOuter = 0;
</script>

<g class="Bars">
  <slot>
    {#each $data as item}
      <Bar
        bar={item}
        {x}
        {y}
        fill={$config.r ? $rGet(item) : null}
        {stroke}
        {strokeWidth}
        {radius}
        {spring}
        {tweened}
        {groupBy}
        {inset}
        {groupPaddingInner}
        {groupPaddingOuter}
        {...$$restProps}
      />
    {/each}
  </slot>
</g>
