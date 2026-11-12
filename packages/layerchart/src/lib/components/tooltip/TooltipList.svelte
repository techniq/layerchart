<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Without } from '$lib/utils/types.js';

  export type TooltipListPropsWithoutHTML = {
    /**
     * Reference to the underlying `div` element.
     */
    ref?: HTMLElement;
  };

  export type TooltipListProps = TooltipListPropsWithoutHTML &
    Without<HTMLAttributes<HTMLElement>, TooltipListPropsWithoutHTML>;
</script>

<script lang="ts">
  import { clsx } from 'clsx';

  let {
    ref: refProp = $bindable(),
    class: className,
    children,
    ...restProps
  }: TooltipListProps = $props();

  let ref = $state<HTMLElement>();

  $effect.pre(() => {
    refProp = ref;
  });
</script>

<div bind:this={ref} class={clsx('lc-tooltip-list', className)} {...restProps}>
  {@render children?.()}
</div>

<style>
  @layer components {
    :where(.lc-tooltip-list) {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 4px 8px;
      align-items: start;
    }
  }
</style>
