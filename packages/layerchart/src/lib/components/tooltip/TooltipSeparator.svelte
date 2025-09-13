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

<div
  bind:this={ref}
  class={cls(
    'lc-tooltip-separator',
    'rounded-sm bg-surface-content/20 my-1 col-span-full h-px',
    className
  )}
  {...restProps}
>
  {@render children?.()}
</div>
