<script lang="ts">
  import { cls } from 'svelte-ux';
</script>

<div class={cls('TooltipHeader', 'header', 'col-span-full', $$props.class)}>
  <slot />
</div>
