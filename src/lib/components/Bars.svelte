<script lang="ts">
  import { getContext } from 'svelte';
  import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';

  import Bar from './Bar.svelte';

  const { data, rGet, config } = getContext('LayerCake');

  /**
   * Override `x` from context.  Useful for multiple Bar instances
   */
  export let x: any = undefined; // TODO: Update Type

  /**
   * Override `y` from context.  Useful for multiple Bar instances
   */
  export let y: any = undefined; // TODO: Update Type

  export let stroke = 'black';
  export let strokeWidth = 0;
  export let radius = 0;
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

</script>

<g class="Bars">
  <slot name="bars">
    {#each $data as item, index}
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
        {padding}
        {groupPaddingInner}
        {groupPaddingOuter}
        {...$$restProps}
      />
    {/each}
  </slot>
</g>
