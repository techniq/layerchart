<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';
  import { asAny, type Without } from '$lib/utils/types.js';

  export type TooltipItemPropsWithoutHTML = {
    /**
     * The label to display in the tooltip item.
     */
    label?: string | number | null | undefined | Snippet;
    /**
     * Value to be formatted and displayed in absence of the
     * default `children` snippet
     */
    value?: any;

    /**
     * Format to use when displaying the value.
     */
    format?: FormatType | FormatConfig;

    /**
     * Alignment of the value.
     *
     * @default 'left'
     */
    valueAlign?: 'left' | 'right' | 'center';

    /**
     * Color to use for the color dot.
     */
    color?: string;

    /**
     * Classes to apply to the parts of the tooltip item.
     *
     * @default {}
     */
    classes?: {
      root?: string;
      label?: string;
      value?: string;
      color?: string;
    };

    props?: {
      root?: HTMLAttributes<HTMLElement>;
      label?: HTMLAttributes<HTMLElement>;
      value?: HTMLAttributes<HTMLElement>;
      color?: HTMLAttributes<HTMLElement>;
    };

    /**
     * A reference to the tooltip item's outermost `<div>` tag.
     */
    ref?: HTMLElement;

    /**
     * A reference to the tooltip item's label `<div>` tag.
     */
    labelRef?: HTMLElement;

    /**
     * A reference to the tooltip item's value `<div>` tag.
     */
    valueRef?: HTMLElement;

    /**
     * A reference to the tooltip item's color `<div>` tag.
     */
    colorRef?: HTMLElement;
  };

  export type TooltipItemProps = TooltipItemPropsWithoutHTML &
    Without<HTMLAttributes<HTMLElement>, TooltipItemPropsWithoutHTML>;
</script>

<script lang="ts">
  import { format as formatUtil, type FormatType, type FormatConfig } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';
  import type { Snippet } from 'svelte';

  let {
    ref: refProp = $bindable(),
    labelRef: labelRefProp = $bindable(),
    valueRef: valueRefProp = $bindable(),
    colorRef: colorRefProp = $bindable(),
    label,
    value,
    format,
    valueAlign = 'left',
    color,
    classes = {
      root: '',
      label: '',
      value: '',
      color: '',
    },
    props = {
      root: {},
      label: {},
      value: {},
      color: {},
    },
    class: className,
    children,
    ...restProps
  }: TooltipItemProps = $props();

  let ref = $state<HTMLElement>();
  let labelRef = $state<HTMLElement>();
  let valueRef = $state<HTMLElement>();
  let colorRef = $state<HTMLElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  $effect.pre(() => {
    labelRefProp = labelRef;
  });
  $effect.pre(() => {
    valueRefProp = valueRef;
  });
  $effect.pre(() => {
    colorRefProp = colorRef;
  });
</script>

<div
  {...props.root}
  class={cls('lc-tooltip-item-root', classes.root, className, props.root?.class)}
  {...restProps}
  bind:this={ref}
>
  <div
    {...props.label}
    class={cls('lc-tooltip-item-label', 'label', classes.label, props.label?.class)}
    bind:this={labelRef}
  >
    {#if color}
      <div
        {...props.color}
        class={cls('lc-tooltip-item-color', 'color', classes.color, props.color?.class)}
        style:--color={color}
        bind:this={colorRef}
      ></div>
    {/if}
    {#if typeof label === 'function'}
      {@render label()}
    {:else}
      {label}
    {/if}
  </div>

  <div
    bind:this={valueRef}
    {...props.value}
    class={cls('lc-tooltip-item-value', 'value', classes.value, props.value?.class)}
    data-align={valueAlign}
  >
    {#if children}
      {@render children()}
    {:else}
      <!-- @ts-expect-error - improve types -->
      {format ? formatUtil(value, asAny(format)) : value}
    {/if}
  </div>
</div>

<style>
  @layer component {
    :where(.lc-tooltip-item-root) {
      display: contents;
    }

    :where(.lc-tooltip-item-color) {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 9999px; /* full */
      background-color: var(--color);
    }

    :where(.lc-tooltip-item-label) {
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
    }

    :where(.lc-tooltip-item-value) {
      /* tabular-nums */
      font-variant-numeric: tabular-nums;

      &[data-align='right'] {
        text-align: right;
      }

      &[data-align='center'] {
        text-align: center;
      }
    }
  }
</style>
