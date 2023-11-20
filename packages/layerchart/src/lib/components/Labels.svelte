<script lang="ts">
  /*
   * TODO
   *   - [ ] Support step curves (center like scaleBand())
   *   - [ ] Support multiple values (threshold, stacks, etc)
   */
  import { getContext, type ComponentProps } from 'svelte';
  import { format as formatValue, type FormatType } from 'svelte-ux';
  import { greatestAbs } from 'svelte-ux/utils/array';

  import Text from './Text.svelte';
  import { isScaleBand } from '$lib/utils/scales';
  import { createDimensionGetter } from '$lib/utils/rect';

  const { flatData, yScale, x, y, custom } = getContext('LayerCake');

  // export let orientation: 'outside' | 'inside' | 'auto' = 'auto';
  export let significantDigits = 3;
  export let format: FormatType | undefined = undefined;
  // export let overlap = false;

  $: yBaseline = $custom?.yBaseline ?? 0;

  export let groupBy: string | undefined = undefined;
  export let groupPaddingInner = 0.2;
  export let groupPaddingOuter = 0;

  $: getDimensions = createDimensionGetter(getContext('LayerCake'), {
    // x,
    // y,
    groupBy,
    // padding,
    groupPadding: {
      inner: groupPaddingInner,
      outer: groupPaddingOuter,
    },
  });

  $: getValue = (item) => (isScaleBand($yScale) ? $x(item) : $y(item));

  $: getLabelValue = (item) => {
    const value = getValue(item);
    return (Array.isArray(value) ? greatestAbs(value) : value) + yBaseline;
  };

  $: getFormattedValue = (item) => {
    const labelValue = getLabelValue(item);
    let formattedValue = labelValue;
    if (labelValue != null) {
      if (format) {
        // Apply more versatile formatting first
        formattedValue = formatValue(labelValue, format ?? $yScale.tickFormat?.());
      }
    }

    return formattedValue ?? '';
  };

  $: getTextProps = (item: any): ComponentProps<Text> => {
    const labelValue = getLabelValue(item);
    const dimensions = $getDimensions(item);

    if (isScaleBand($yScale)) {
      // Position label left/right on horizontal bars
      if (labelValue < 0) {
        // left
        return {
          x: dimensions?.x - 4,
          y: dimensions?.y + (dimensions?.height ?? 0) / 2,
          textAnchor: 'end',
          verticalAnchor: 'middle',
          capHeight: '.6rem',
        };
      } else {
        // right
        return {
          x: dimensions?.x + dimensions?.width + 4,
          y: dimensions?.y + (dimensions?.height ?? 0) / 2,
          textAnchor: 'start',
          verticalAnchor: 'middle',
          capHeight: '.6rem',
        };
      }
    } else {
      // Position label top/bottom on vertical bars
      if (labelValue < 0) {
        // bottom
        return {
          x: dimensions?.x + (dimensions?.width ?? 0) / 2,
          y: dimensions?.y + dimensions?.height,
          dy: '0.5em',
          textAnchor: 'middle',
          verticalAnchor: 'middle',
        };
      } else {
        // top
        return {
          x: dimensions?.x + (dimensions?.width ?? 0) / 2,
          y: dimensions?.y,
          dy: '-0.6em',
          textAnchor: 'middle',
          verticalAnchor: 'middle',
        };
      }
    }
  };
</script>

<g class="Labels">
  {#each $flatData as item, index}
    <!-- TODO: Add labels for each item when array/stack?  Use `getValue(item)` instead and iterate -->
    <Text
      value={getFormattedValue(item)}
      class="text-xs stroke-white [stroke-width:2px]"
      {...getTextProps(item)}
      {...$$restProps}
    />
  {/each}
</g>
