<script lang="ts">
  import { cls } from 'svelte-ux';
</script>

<div class={cls('TooltipHeader', 'font-semibold border-b mb-1 pb-1', $$props.class)}>
  <slot />
</div>
