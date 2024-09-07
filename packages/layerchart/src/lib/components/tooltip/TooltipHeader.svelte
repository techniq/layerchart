<script lang="ts">
  import { cls } from '@layerstack/tailwind';

  export let color: string | undefined = undefined;

  export let classes: {
    root?: string;
    color?: string;
  } = {};
</script>

<div
  class={cls(
    'TooltipHeader',
    'font-semibold whitespace-nowrap border-b mb-1 pb-1 flex items-center gap-2',
    classes.root,
    $$props.class
  )}
>
  {#if color}
    <div
      class={cls('color', 'inline-block size-2 rounded-full bg-[--color]', classes.color)}
      style:--color={color}
    ></div>
  {/if}
  <slot />
</div>
