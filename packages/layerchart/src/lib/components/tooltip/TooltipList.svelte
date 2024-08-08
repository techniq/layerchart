<script lang="ts">
  import { cls } from 'svelte-ux';
</script>

<div
  class={cls(
    'TooltipList',
    'grid grid-cols-[1fr,auto] gap-x-2 gap-y-1 items-center',
    $$props.class
  )}
>
  <slot />
</div>
