<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Without } from '$lib/utils/types.js';

  export type TooltipSeparatorPropsWithoutHTML = {
    /**
     * Reference to the underlying `div` element.
     */
    ref?: HTMLElement;
  };

  export type TooltipSeparatorProps = TooltipSeparatorPropsWithoutHTML &
    Without<HTMLAttributes<HTMLElement>, TooltipSeparatorPropsWithoutHTML>;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';

  let {
    ref: refProp = $bindable(),
    class: className,
    children,
    ...restProps
  }: TooltipSeparatorProps = $props();

  let ref = $state<HTMLElement>();
  $effect.pre(() => {
    refProp = ref;
  });
</script>

<div bind:this={ref} class={cls('lc-tooltip-separator', className)} {...restProps}>
  {@render children?.()}
</div>

<style>
  @layer components {
    :where(.lc-tooltip-separator) {
      height: 1px;
      border-radius: 4px;
      background-color: color-mix(
        in oklab,
        var(--color-surface-content, currentColor) 20%,
        transparent
      );
      margin-top: 4px;
      margin-bottom: 4px;
      grid-column: 1 / -1; /* col-span-full */
    }
  }
</style>
