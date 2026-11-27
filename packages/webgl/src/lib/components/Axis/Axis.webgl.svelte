<script lang="ts" module>
  import type { AxisProps } from './Axis.shared.svelte.js';
</script>

<script lang="ts">
  import { getFacetPanel } from 'layerchart/base';
  import Group from '../Group/Group.webgl.svelte';
  import AxisBase from './Axis.base.svelte';

  let {
    x,
    initialX,
    y,
    initialY,
    data,
    key,
    seriesKey,
    center,
    opacity,
    facetAll = false,
    ...props
  }: AxisProps = $props();

  /**
   * In a faceted chart, only on the grid's outer edge (a left axis on the first column, a bottom
   * one on the last row), as the core `Axis`, unless `facetAll`
   */
  const facetPanel = getFacetPanel();
  const visible = $derived.by(() => {
    const facet = facetPanel?.();
    if (!facet || facetAll) return true;
    switch (props.placement) {
      case 'left':
      case 'radius':
        return facet.left;
      case 'right':
        return facet.right;
      case 'top':
        return facet.top;
      case 'bottom':
      case 'angle':
        return facet.bottom;
    }
    return true;
  });

  /** Placed (or faded) as a `Group`, as the core `Axis` is one */
  const grouped = $derived(
    [x, initialX, y, initialY, data, key, seriesKey, center, opacity].some((v) => v !== undefined)
  );
</script>

{#if !visible}
  <!-- Another panel's, on the grid's outer edge -->
{:else if grouped}
  <Group {x} {initialX} {y} {initialY} {data} {key} {seriesKey} {center} {opacity}>
    <AxisBase {...props} />
  </Group>
{:else}
  <AxisBase {...props} />
{/if}
