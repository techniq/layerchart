<script lang="ts">
  import { cls, format as formatUtil, type FormatType } from 'svelte-ux';

  export let label: any;
  export let value: any = undefined; // Can be pass as slot
  export let format: FormatType = undefined;

  export let valueAlign: 'left' | 'right' | 'center' = 'left';

  export let classes: {
    label?: string;
    value?: string;
  } = {};
</script>

<div class={cls('text-xs text-white/75 text-right whitespace-nowrap', classes.label)}>
  <slot name="label">{label}:</slot>
</div>

<div
  class={cls(
    'text-sm tabular-nums',
    {
      'text-right': valueAlign === 'right',
      'text-center': valueAlign === 'center'
    },
    classes.value,
    $$props.class
  )}
>
  <slot>{format ? formatUtil(value, format) : value}</slot>
</div>
