<script lang="ts">
  import { cls } from 'svelte-ux';
</script>

<div class={cls('TooltipHeader', 'font-medium', $$props.class)}>
  <slot />
</div>
