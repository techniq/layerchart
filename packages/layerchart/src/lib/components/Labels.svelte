<script lang="ts">
  import { type ComponentProps } from 'svelte';
  import { format as formatValue, type FormatType } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import Text from './Text.svelte';
  import { isScaleBand } from '$lib/utils/scales.js';
  import { chartContext } from './ChartContext.svelte';
  import Points, { type Point } from './Points.svelte';
  import { accessor, type Accessor } from '../utils/common.js';

  const { xScale, yScale } = chartContext();

  /** Override data instead of using context */
  export let data: any = undefined;

  /** Override display value accessor.  By default, uses `y` unless yScale is band scale   */
  export let value: Accessor = undefined;

  /** Override `x` accessor from Chart context */
  export let x: Accessor = undefined;
  /** Override `y` accessor from Chart context */
  export let y: Accessor = undefined;

  export let placement: 'inside' | 'outside' | 'center' = 'outside';
  export let offset = placement === 'center' ? 0 : 4;
  export let format: FormatType | undefined = undefined;

  /** Define unique value for {#each} `(key)` expressions to improve transitions.  `index` position used by default */
  export let key: (d: any, index: number) => any = (d, i) => i;

  $: getTextProps = (point: Point): ComponentProps<Text> => {
    // Used for positioning
    const pointValue = isScaleBand($yScale) ? point.xValue : point.yValue;

    const displayValue = value
      ? accessor(value)(point.data)
      : isScaleBand($yScale)
        ? point.xValue
        : point.yValue;

    const formattedValue = formatValue(
      displayValue,
      format ??
        (value ? undefined : isScaleBand($yScale) ? $xScale.tickFormat?.() : $yScale.tickFormat?.())
    );

    if (isScaleBand($yScale)) {
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
  };
</script>

<g class="Labels">
  <Points {data} {x} {y} let:points>
    {#each points as point, i (key(point.data, i))}
      {@const textProps = getTextProps(point)}
      <slot data={point} {textProps}>
        <Text
          {...textProps}
          {...$$restProps}
          class={cls(
            'text-xs',
            placement === 'inside'
              ? 'fill-surface-300 stroke-surface-content'
              : 'fill-surface-content stroke-surface-100',
            textProps.class,
            $$props.class
          )}
        />
      </slot>
    {/each}
  </Points>
</g>
