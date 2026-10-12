<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';
  import { asAny, type Without } from '$lib/utils/types.js';

  export type TooltipItemPropsWithoutHTML = {
    /**
     * Series this item shows.  Its `label`, `value` (for the row being shown), and `color` are
     * used unless passed explicitly, hovering the item highlights the series, and the item isn't
     * rendered while the series is hidden.
     */
    seriesKey?: string;

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
  import { getChartContext } from '$lib/contexts/chart.js';

  let {
    ref: refProp = $bindable(),
    labelRef: labelRefProp = $bindable(),
    valueRef: valueRefProp = $bindable(),
    colorRef: colorRefProp = $bindable(),
    seriesKey,
    label: labelProp,
    value: valueProp,
    format,
    valueAlign = 'left',
    color: colorProp,
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
    onpointerenter,
    onpointerleave,
    ...restProps
  }: TooltipItemProps = $props();

  const ctx = getChartContext();

  /** The series as resolved for the row being shown */
  const tooltipSeries = $derived(
    seriesKey == null ? undefined : ctx.tooltip.series.find((s) => s.key === seriesKey)
  );

  const visible = $derived.by(() => {
    if (seriesKey == null) return true;
    // Read live rather than from `tooltipSeries`, which only updates when the pointer moves.  A key
    // that names no series is a `c` category, which the legend selects directly.
    if (ctx.series.series.some((s) => s.key === seriesKey)) {
      return ctx.series.isVisible(seriesKey);
    }
    return ctx.series.selectedKeys.isEmpty() || ctx.series.selectedKeys.isSelected(seriesKey);
  });

  const label = $derived(labelProp ?? tooltipSeries?.label ?? seriesKey);
  const value = $derived(valueProp !== undefined ? valueProp : tooltipSeries?.value);
  const color = $derived(colorProp ?? tooltipSeries?.color);

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

{#if visible}
  <div
    {...props.root}
    class={cls('lc-tooltip-item-root', classes.root, className, props.root?.class)}
    data-highlighted={seriesKey != null ? ctx.series.isHighlighted(seriesKey, true) : undefined}
    {...restProps}
    onpointerenter={(e) => {
      if (seriesKey != null) ctx.series.highlightKey = seriesKey;
      onpointerenter?.(e);
    }}
    onpointerleave={(e) => {
      if (seriesKey != null) ctx.series.highlightKey = null;
      onpointerleave?.(e);
    }}
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
{/if}

<style>
  @layer components {
    :where(.lc-tooltip-item-root) {
      display: contents;
    }

    :where(.lc-tooltip-item-root[data-highlighted])
      > :where(.lc-tooltip-item-label, .lc-tooltip-item-value) {
      opacity: 1;
      transition: opacity 150ms ease;
    }

    :where(.lc-tooltip-item-root[data-highlighted='false'])
      > :where(.lc-tooltip-item-label, .lc-tooltip-item-value) {
      opacity: 0.1;
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
