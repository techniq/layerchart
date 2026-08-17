<script lang="ts">
  import Axis from './Axis/Axis.svelte';
  import Group from './Group/Group.svelte';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getFacetPanel } from '$lib/contexts/facet.js';
  import { getObjectOrNull } from '$lib/utils/common.js';

  const ctx = getChartContext();

  // Rendered inside the layer, which repeats its children per panel — but the headers belong to
  // the grid, so they're drawn once, from the panel at the plot's origin.
  const panel = getFacetPanel();
  const isFirstPanel = $derived.by(() => {
    const current = panel?.();
    return current == null || (current.column === 0 && current.row === 0);
  });

  const axis = $derived(ctx.props.facet?.axis ?? true);
  const axisProps = $derived(getObjectOrNull(axis));
</script>

<!--
  Headers for the facet grid.  `fx` / `fy` are scales, so these are axes over them — drawn once
  across the top and down the right rather than once per panel.

  Kept out of `Facet` (which every layer renders) so that `Axis` isn't pulled into the bundle of
  every chart: this is rendered by `Chart`'s default layout, which already depends on `Axis`.
-->
{#if ctx.facet.enabled && axis !== false && isFirstPanel}
  {#if ctx.facet.xScale && ctx.facet.xDomain.length > 1}
    <Axis
      placement="top"
      scale={ctx.facet.xScale}
      ticks={ctx.facet.xDomain}
      tickLength={0}
      tickLabelProps={{ dy: -8 }}
      rule={false}
      class="lc-facet-axis-x"
      {...axisProps}
    />
  {/if}

  {#if ctx.facet.yScale && ctx.facet.yDomain.length > 1}
    <!-- Shifted to the plot's right edge: `Axis` positions from the *panel* range -->
    <Group x={ctx.box.width - ctx.facet.width}>
      <Axis
        placement="right"
        scale={ctx.facet.yScale}
        ticks={ctx.facet.yDomain}
        tickLength={0}
        tickLabelProps={{ dx: 8 }}
        rule={false}
        class="lc-facet-axis-y"
        {...axisProps}
      />
    </Group>
  {/if}
{/if}
