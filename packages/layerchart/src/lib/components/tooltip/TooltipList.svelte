<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { createDataAttr } from '$lib/utils/attributes.js';
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
  {...createDataAttr('tooltip-list')}
  bind:this={ref}
  class={cls('grid grid-cols-[1fr_auto] gap-x-2 gap-y-1 items-center', className)}
  {...restProps}
>
  {@render children?.()}
</div>
