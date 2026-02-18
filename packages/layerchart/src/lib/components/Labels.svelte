<script lang="ts" module>
  import Text, { type TextProps } from './Text.svelte';
  import { type ComponentProps, type Snippet } from 'svelte';
  import { format as formatValue, type FormatType, type FormatConfig } from '@layerstack/utils';
  import type { Without } from '$lib/utils/types.js';
  import Points, { type Point } from './Points.svelte';
  import { accessor, type Accessor } from '../utils/common.js';

  export type LabelsPropsWithoutHTML<T = any> = {
    /**
     * Override data instead of using context
     */
    data?: T;

    /**
     * Override display value accessor.  By default, uses `y` unless yScale is band scale
     */
    value?: Accessor<T>;

    /**
     * The fill color of the label, which can either be a string or an accessor function
     * that returns a valid `fill` color value.
     *
     * The accessor is useful for dynamic fill colors based on the data the label represents.
     */
    fill?: string | Accessor<T>;

    /**
     * Override `x` accessor from Chart context
     */
    x?: Accessor<T>;

    /**
     * Override `y` accessor from Chart context
     */
    y?: Accessor<T>;

    /**
     * The placement of the label relative to the point
     * @default 'outside'
     */
    placement?: 'inside' | 'outside' | 'center';

    /**
     * The offset of the label from the point
     *
     * @default placement === 'center' ? 0 : 4
     */
    offset?: number;

    /**
     * The format of the label
     */
    format?: FormatType | FormatConfig;

    /**
     * Define unique value for {#each} `(key)` expressions to improve transitions.
     * `index` position used by default
     *
     * @default (d, index) => index
     */
    key?: (d: T, index: number) => any;

    children?: Snippet<[{ data: Point; textProps: ComponentProps<typeof Text> }]>;
  };

  export type LabelsProps<T = any> = LabelsPropsWithoutHTML<T> &
    Without<TextProps, LabelsPropsWithoutHTML<T>>;
</script>

<script lang="ts" generics="TData = any">
  import { cls } from '@layerstack/tailwind';

  import { isScaleBand } from '$lib/utils/scales.svelte.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import Group from './Group.svelte';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  const ctx = getChartContext();

  let {
    data,
    value,
    x,
    y,
    placement = 'outside',
    offset = placement === 'center' ? 0 : 4,
    format,
    key = (_: any, i: number) => i,
    children: childrenProp,
    class: className,
    fill,
    ...restProps
  }: LabelsProps<TData> = $props();

  function getTextProps(point: Point): ComponentProps<typeof Text> {
    // Used for positioning
    const pointValue = isScaleBand(ctx.yScale) ? point.xValue : point.yValue;

    // extract the true fill value from `fill` which could be an
    // accessor function or string/undefined
    const fillValue = typeof fill === 'function' ? accessor(fill)(point.data) : fill;

    const displayValue = value
      ? accessor(value)(point.data)
      : isScaleBand(ctx.yScale)
        ? point.xValue
        : point.yValue;

    const formattedValue = formatValue(
      displayValue,
      // @ts-expect-error - improve types
      format ??
        (value
          ? undefined
          : isScaleBand(ctx.yScale)
            ? ctx.xScale.tickFormat?.()
            : ctx.yScale.tickFormat?.())
    );

    if (isScaleBand(ctx.yScale)) {
      // Position label left/right on horizontal bars
      if (pointValue < 0) {
        // left
        return {
          value: formattedValue,
          fill: fillValue,
          x: point.x + (placement === 'outside' ? -offset : offset),
          y: point.y,
          textAnchor: placement === 'outside' ? 'end' : 'start',
          verticalAnchor: 'middle',
          capHeight: '.6rem',
        };
      } else {
        // right
        return {
          value: formattedValue,
          fill: fillValue,
          x: point.x + (placement === 'outside' ? offset : -offset),
          y: point.y,
          textAnchor: placement === 'outside' ? 'start' : 'end',
          verticalAnchor: 'middle',
          capHeight: '.6rem',
        };
      }
    } else {
      // Position label top/bottom on vertical bars
      if (pointValue < 0) {
        // bottom
        return {
          value: formattedValue,
          fill: fillValue,
          x: point.x,
          y: point.y + (placement === 'outside' ? offset : -offset),
          capHeight: '.6rem',
          textAnchor: 'middle',
          verticalAnchor:
            placement === 'center' ? 'middle' : placement === 'outside' ? 'start' : 'end',
        };
      } else {
        // top
        return {
          value: formattedValue,
          fill: fillValue,
          x: point.x,
          y: point.y + (placement === 'outside' ? -offset : offset),
          capHeight: '.6rem',
          textAnchor: 'middle',
          verticalAnchor:
            placement === 'center' ? 'middle' : placement === 'outside' ? 'end' : 'start',
        };
      }
    }
  }
</script>

<Group class="lc-labels-g">
  <Points {data} {x} {y}>
    {#snippet children({ points })}
      {#each points as point, i (key(point.data, i))}
        {@const textProps = extractLayerProps(getTextProps(point), 'lc-labels-text')}
        {#if childrenProp}
          {@render childrenProp({ data: point, textProps })}
        {:else}
          <Text
            data-placement={placement}
            {...textProps}
            {...restProps}
            {...extractLayerProps(getTextProps(point), 'lc-labels-text', className ?? '')}
          />
        {/if}
      {/each}
    {/snippet}
  </Points>
</Group>

<style>
  @layer components {
    :global(:where(.lc-labels-text)) {
      font-size: 12px;

      --fill-color: var(--color-surface-content, currentColor);
      --stroke-color: var(--color-surface-100, light-dark(white, black));

      &[data-placement='inside'] {
        --fill-color: var(--color-surface-100, light-dark(white, black));
        --stroke-color: var(--color-surface-content, currentColor);
      }
    }
  }
</style>
