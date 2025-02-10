<script lang="ts">
  import { cls } from '@layerstack/tailwind';
</script>

<div
  class={cls(
    'TooltipList',
    'grid grid-cols-[1fr_auto] gap-x-2 gap-y-1 items-center',
    $$props.class
  )}
>
  <slot />
</div>
