<script lang="ts">
  import { type ComponentProps } from 'svelte';

  import { chartContext } from './ChartContext.svelte';
  import Bar from './Bar.svelte';
  import Rect from './Rect.svelte';
  import { chartDataArray, type Accessor } from '../utils/common.js';

  const { data: contextData, cGet, config } = chartContext();

  /**
   * Override `data` from context.  Useful for multiple Bar instances
   */
  export let data: any = undefined;

  /**
   * Override `x` from context.  Useful for multiple Bar instances
   */
  export let x: Accessor = undefined;

  /**
   * Override `y` from context.  Useful for multiple Bar instances
   */
  export let y: Accessor = undefined;

  /**
   * Override `x1` from context.  Useful for multiple Bar instances
   */
  export let x1: Accessor = undefined;

  /**
   * Override `y1` from context.  Useful for multiple Bar instances
   */
  export let y1: Accessor = undefined;

  export let stroke = 'black';
  export let strokeWidth = 0;
  export let radius = 0;
  export let fill: string | undefined = undefined;

  /** Inset the rect for amount of padding.  Useful with multiple bars (bullet, overlap, etc) */
  export let inset = 0;

  /** Define unique value for {#each} `(key)` expressions to improve transitions.  `index` position used by default */
  export let key: (d: any, index: number) => any = (d, i) => i;

  export let spring: ComponentProps<Rect>['spring'] = undefined;
  export let tweened: ComponentProps<Rect>['tweened'] = undefined;

  $: _data = chartDataArray(data ?? $contextData);
</script>

<g class="Bars">
  <slot>
    {#each _data as d, i (key(d, i))}
      <Bar
        bar={d}
        {x}
        {y}
        {x1}
        {y1}
        fill={fill ?? ($config.c ? $cGet(d) : null)}
        {stroke}
        {strokeWidth}
        {radius}
        {inset}
        {spring}
        {tweened}
        {...$$restProps}
      />
    {/each}
  </slot>
</g>
