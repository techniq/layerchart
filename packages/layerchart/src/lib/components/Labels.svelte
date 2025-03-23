<script lang="ts" module>
  import Text, { type TextProps } from './Text.svelte';
  import { type ComponentProps, type Snippet } from 'svelte';
  import { format as formatValue, type FormatType } from '@layerstack/utils';
  import type { Without } from '$lib/utils/types.js';
  import Points, { type Point } from './Points.svelte';
  import { accessor, type Accessor } from '../utils/common.js';

  export type LabelsPropsWithoutHTML = {
    /**
     * Override data instead of using context
     */
    data?: any;

    /**
     * Override display value accessor.  By default, uses `y` unless yScale is band scale
     */
    value?: Accessor;

    /**
     * Override `x` accessor from Chart context
     */
    x?: Accessor;

    /**
     * Override `y` accessor from Chart context
     */
    y?: Accessor;

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
    format?: FormatType;

    /**
     * Define unique value for {#each} `(key)` expressions to improve transitions.
     * `index` position used by default
     *
     * @default (d, index) => index
     */
    key?: (d: any, index: number) => any;

    children?: Snippet<[{ data: Point; textProps: ComponentProps<typeof Text> }]>;
  };

  export type LabelsProps = LabelsPropsWithoutHTML & Without<TextProps, LabelsPropsWithoutHTML>;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';

  import { isScaleBand } from '$lib/utils/scales.svelte.js';
  import { getChartContext } from './Chart.svelte';
  import { extractLayerProps, layerClass } from 'layerchart/utils/attributes.js';

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
    ...restProps
  }: LabelsProps = $props();

  function getTextProps(point: Point): ComponentProps<typeof Text> {
    // Used for positioning
    const pointValue = isScaleBand(ctx.yScale) ? point.xValue : point.yValue;

    const displayValue = value
      ? accessor(value)(point.data)
      : isScaleBand(ctx.yScale)
        ? point.xValue
        : point.yValue;

    const formattedValue = formatValue(
      displayValue,
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

<g class={layerClass('labels-g')}>
  <Points {data} {x} {y}>
    {#snippet children({ points })}
      {#each points as point, i (key(point.data, i))}
        {@const textProps = extractLayerProps(getTextProps(point), 'labels-text')}
        {#if childrenProp}
          {@render childrenProp({ data: point, textProps })}
        {:else}
          <Text
            {...textProps}
            {...restProps}
            class={cls(
              'text-xs',
              placement === 'inside'
                ? 'fill-surface-300 stroke-surface-content'
                : 'fill-surface-content stroke-surface-100',
              textProps.class,
              className
            )}
          />
        {/if}
      {/each}
    {/snippet}
  </Points>
</g>
