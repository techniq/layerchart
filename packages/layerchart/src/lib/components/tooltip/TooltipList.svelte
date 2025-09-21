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

<div bind:this={ref} class={cls('lc-tooltip-list', className)} {...restProps}>
  {@render children?.()}
</div>

<style>
  @layer component {
    :where(.lc-tooltip-list) {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 4px 8px;
      align-items: start;
    }
  }
</style>
