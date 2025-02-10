<script lang="ts">
  import { format as formatUtil, type FormatType } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  export let label: any;
  /** Value to be formatted and displayed.  Can also be passed as default slot */
  export let value: any = undefined;
  export let format: FormatType | undefined = undefined;
  export let valueAlign: 'left' | 'right' | 'center' = 'left';
  export let color: string | undefined = undefined;

  export let classes: {
    root?: string;
    label?: string;
    value?: string;
    color?: string;
  } = {};
</script>

<div class={cls('contents', classes.root, $$props.class)} {...$$restProps}>
  <div class={cls('label', 'flex items-center gap-2 whitespace-nowrap', classes.label)}>
    {#if color}
      <div
        class={cls('color', 'inline-block size-2 rounded-full bg-[var(--color)]', classes.color)}
        style:--color={color}
      ></div>
    {/if}
    <slot name="label">{label}</slot>
  </div>

  <div
    class={cls(
      'value',
      'tabular-nums',
      {
        'text-right': valueAlign === 'right',
        'text-center': valueAlign === 'center',
      },
      classes.value,
      $$props.class
    )}
  >
    <slot>{format ? formatUtil(value, format) : value}</slot>
  </div>
</div>
