<script lang="ts">
  import { cls } from '@layerstack/tailwind';
</script>

<div
  class={cls('TooltipHeader', 'font-semibold whitespace-nowrap border-b mb-1 pb-1', $$props.class)}
>
  <slot />
</div>
