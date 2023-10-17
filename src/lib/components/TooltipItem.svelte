<script lang="ts">
  import { cls, format as formatUtil, type FormatType } from 'svelte-ux';

  export let label: any;
  /** Value to be formatted and displayed.  Can also be passed as default slot */
  export let value: any = undefined;
  export let format: FormatType = undefined;
  export let valueAlign: 'left' | 'right' | 'center' = 'left';

  export let classes: {
    label?: string;
    value?: string;
  } = {};
</script>

<div class={cls('label', classes.label)}>
  <slot name="label">{label}:</slot>
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
