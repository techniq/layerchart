<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { layerClass } from 'layerchart/utils/attributes.js';
  import type { HTMLAttributes } from 'svelte/elements';

  let {
    ref = $bindable(),
    class: className,
    children,
    ...restProps
  }: HTMLAttributes<HTMLElement> & {
    ref?: HTMLElement;
  } = $props();
</script>

<div
  bind:this={ref}
  class={cls(
    layerClass('tooltip-separator'),
    'rounded-sm bg-surface-content/20 my-1 col-span-full h-px',
    className
  )}
  {...restProps}
>
  {@render children?.()}
</div>
