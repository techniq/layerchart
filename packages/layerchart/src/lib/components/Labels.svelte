<script lang="ts">
  /*
   * TODO
   *   - [ ] Support step curves (center like scaleBand())
   *   - [ ] Support multiple values (threshold, stacks, etc)
   */
  import { getContext, type ComponentProps } from 'svelte';
  import { format as formatValue, type FormatType, cls } from 'svelte-ux';
  import { greatestAbs } from 'svelte-ux/utils/array';

  import Text from './Text.svelte';
  import { isScaleBand } from '$lib/utils/scales.js';
  import { createDimensionGetter } from '$lib/utils/rect.js';

  const { flatData, yScale, x, y, custom } = getContext('LayerCake');

  // TODO: Support 'auto' to switch `inside` to `outside` if not enough room
  export let placement: 'inside' | 'outside' = 'outside';
  export let offset = 4;
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

  $: getLabelText = (item) => (isScaleBand($yScale) ? $y(item) : $x(item));
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

  $: getPosition = (item: any): { x: number; y: number } => {
    const labelValue = getLabelValue(item);
    const dimensions = $getDimensions(item);

    if (isScaleBand($yScale)) {
      // Position label left/right on horizontal bars
      if (labelValue < 0) {
        // left
        return {
          x: dimensions?.x + (placement === 'outside' ? -offset : offset),
          y: dimensions?.y + (dimensions?.height ?? 0) / 2,
        };
      } else {
        // right
        return {
          x: dimensions?.x + dimensions?.width + (placement === 'outside' ? offset : -offset),
          y: dimensions?.y + (dimensions?.height ?? 0) / 2,
        };
      }
    } else {
      // Position label top/bottom on vertical bars
      if (labelValue < 0) {
        // bottom
        return {
          x: dimensions?.x + (dimensions?.width ?? 0) / 2,
          y: dimensions?.y + dimensions?.height + (placement === 'outside' ? offset : -offset),
        };
      } else {
        // top
        return {
          x: dimensions?.x + (dimensions?.width ?? 0) / 2,
          y: dimensions?.y + (placement === 'outside' ? -offset : offset),
        };
      }
    }
  };

  $: getTextProps = (item: any): ComponentProps<Text> => {
    const labelValue = getLabelValue(item);
    const dimensions = $getDimensions(item);

    if (isScaleBand($yScale)) {
      // Position label left/right on horizontal bars
      if (labelValue < 0) {
        // left
        return {
          textAnchor: placement === 'outside' ? 'end' : 'start',
          verticalAnchor: 'middle',
          capHeight: '.6rem',
        };
      } else {
        // right
        return {
          textAnchor: placement === 'outside' ? 'start' : 'end',
          verticalAnchor: 'middle',
          capHeight: '.6rem',
        };
      }
    } else {
      // Position label top/bottom on vertical bars
      if (labelValue < 0) {
        // bottom
        return {
          capHeight: '.6rem',
          textAnchor: 'middle',
          verticalAnchor: placement === 'outside' ? 'start' : 'end',
        };
      } else {
        // top
        return {
          capHeight: '.6rem',
          textAnchor: 'middle',
          verticalAnchor: placement === 'outside' ? 'end' : 'start',
        };
      }
    }
  };
</script>

<g class="Labels">
  <!-- TODO: Determine way to set lookup -->
  <!-- {#each $flatData as d, i (getLabelText(d))} -->
  {#each $flatData as d}
    {@const value = getValue(d)}
    {@const position = getPosition(d)}
    {@const textProps = getTextProps(d)}
    <!-- TODO: Add labels for each item when array/stack?  Use `getValue(item)` instead and iterate -->
    <slot data={d} {value} {position} {textProps}>
      <Text
        value={getFormattedValue(d)}
        class={cls(
          'text-xs',
          placement === 'inside'
            ? 'fill-surface-300 stroke-surface-content'
            : 'fill-surface-content stroke-surface-100'
        )}
        {...position}
        {...textProps}
        {...$$restProps}
      />
    </slot>
  {/each}
</g>
