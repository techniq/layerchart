<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import type { HTMLAttributes } from 'svelte/elements';

  let {
    ref: refProp = $bindable(),
    class: className,
    children,
    ...restProps
  }: HTMLAttributes<HTMLElement> & {
    ref?: HTMLElement;
  } = $props();

  let ref = $state<HTMLElement>();
  $effect.pre(() => {
    refProp = ref;
  });
</script>

<div bind:this={ref} class={cls('lc-tooltip-separator', className)} {...restProps}>
  {@render children?.()}
</div>

<style>
  @layer component {
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
