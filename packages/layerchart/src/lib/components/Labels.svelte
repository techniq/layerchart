<script lang="ts">
  import { type ComponentProps } from 'svelte';
  import { format as formatValue, type FormatType } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import Text from './Text.svelte';
  import { isScaleBand } from '$lib/utils/scales.js';
  import { chartContext } from './ChartContext.svelte';
  import Points, { type Point } from './Points.svelte';

  export let placement: 'inside' | 'outside' | 'center' = 'outside';
  export let offset = placement === 'center' ? 0 : 4;
  export let format: FormatType | undefined = undefined;

  const { yScale } = chartContext();

  $: getTextProps = (point: Point): ComponentProps<Text> => {
    const value = isScaleBand($yScale) ? point.xValue : point.yValue;
    const formattedValue = formatValue(value, format ?? $yScale.tickFormat?.());

    if (isScaleBand($yScale)) {
      // Position label left/right on horizontal bars
      if (value < 0) {
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
      if (value < 0) {
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
  <Points let:points>
    {#each points as point}
      <Text
        class={cls(
          'text-xs',
          placement === 'inside'
            ? 'fill-surface-300 stroke-surface-content'
            : 'fill-surface-content stroke-surface-100'
        )}
        {...getTextProps(point)}
        {...$$restProps}
      />
    {/each}
  </Points>
</g>
