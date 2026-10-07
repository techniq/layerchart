<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { ArcLabelProps } from './ArcLabel.shared.svelte.js';

  export type ArcLabelBaseLayerComponents = {
    Path: Component<any>;
    Text: Component<any>;
  };

  export type ArcLabelBaseProps = ArcLabelProps & ArcLabelBaseLayerComponents;
</script>

<script lang="ts">
  import { ArcLabelState } from './ArcLabel.shared.svelte.js';

  let {
    Path,
    Text,
    getArcTextProps,
    centroid,
    startAngle,
    endAngle,
    innerRadius,
    outerRadius,
    placement = 'centroid',
    startOffset,
    outerPadding,
    calloutLineLength = 16,
    calloutLabelOffset = 12,
    calloutPadding = 4,
    line,
    offset = 0,
    z,
    ...restProps
  }: ArcLabelBaseProps = $props();

  const c = new ArcLabelState(
    () =>
      ({
        getArcTextProps,
        centroid,
        startAngle,
        endAngle,
        innerRadius,
        outerRadius,
        placement,
        startOffset,
        outerPadding,
        calloutLineLength,
        calloutLabelOffset,
        calloutPadding,
        line,
        offset,
        z,
      }) as ArcLabelProps
  );
</script>

{#if placement === 'callout' && c.calloutGeometry}
  <Path
    pathData={c.calloutGeometry.pathData}
    {...line}
    z={c.labelHeight != null ? [c.labelHeight, c.labelHeight] : line?.z}
  />
{/if}

<Text {...c.arcTextProps} {...restProps} z={c.labelHeight} />
