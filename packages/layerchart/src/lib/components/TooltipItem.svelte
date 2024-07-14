<script lang="ts">
  import { cls, format as formatUtil, type FormatType, type ThemeColors } from 'svelte-ux';

  export let label: any;
  /** Value to be formatted and displayed.  Can also be passed as default slot */
  export let value: any = undefined;
  export let format: FormatType | undefined = undefined;
  export let valueAlign: 'left' | 'right' | 'center' = 'left';
  export let color: ThemeColors | 'variable' | undefined = undefined;

  export let classes: {
    root?: string;
    label?: string;
    value?: string;
    color?: string;
  } = {};
</script>

<div class={cls('contents', classes.root, $$props.class)} {...$$restProps}>
  <div class={cls('label', 'flex items-center gap-2', classes.label)}>
    {#if color}
      <div
        class={cls(
          'color',
          'inline-block size-2 rounded-full',
          {
            primary: 'bg-primary',
            secondary: 'bg-secondary',
            accent: 'bg-accent',
            neutral: 'bg-neutral',
            info: 'bg-info',
            success: 'bg-success',
            warning: 'bg-warning',
            danger: 'bg-danger',
            variable: 'bg-[--color]',
          }[color.toString()],
          classes.color
        )}
      ></div>
    {/if}
    <slot name="label">{label}</slot>
  </div>

  <div
    class={cls(
      'value',
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
