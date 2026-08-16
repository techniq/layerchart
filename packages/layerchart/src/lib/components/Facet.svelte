<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { Facet } from '$lib/states/facet.svelte.js';

  export type FacetProps = {
    /**
     * Rendered once per panel and translated into place, with that panel provided as context —
     * which is where marks resolve their rows from.
     *
     * Safe to use unconditionally: without `fx` / `fy` on the `Chart` there is a single panel
     * covering the whole plot area, and it renders inline with no wrapper.
     */
    children?: Snippet<[{ facet: Facet }]>;
  };
</script>

<script lang="ts">
  import FacetPanel from './FacetPanel.svelte';
  import Group from './Group/Group.svelte';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getObjectOrNull } from '$lib/utils/common.js';

  // `Axis` is imported lazily below, and only when the panel headers are actually drawn.  Every
  // layer renders a `<Facet>`, so importing it here would put `Axis` — one of the larger
  // components — in the bundle of every chart, faceted or not.

  let { children }: FacetProps = $props();

  const ctx = getChartContext();

  const axis = $derived(ctx.props.facet?.axis ?? true);
  const axisProps = $derived(getObjectOrNull(axis));

  const showXAxis = $derived(
    axis !== false && ctx.facet.xScale != null && ctx.facet.xDomain.length > 1
  );
  const showYAxis = $derived(
    axis !== false && ctx.facet.yScale != null && ctx.facet.yDomain.length > 1
  );
</script>

{#if ctx.facet.enabled}
  {#if showXAxis || showYAxis}
    {#await import('./Axis/Axis.svelte') then { default: Axis }}
      <!--
        `fx` / `fy` are scales, so their headers are axes over them — drawn once here rather than
        per panel.  `tickLength` / `rule` are off because the panel's own axes carry those.
      -->
      {#if showXAxis}
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

      {#if showYAxis}
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
    {/await}
  {/if}

  {#each ctx.facet.panels as facet (facet.key)}
    <FacetPanel {facet} {children} />
  {/each}
{:else}
  <!-- Unfaceted charts pay nothing — no group, no wrapper -->
  {@render children?.({ facet: ctx.facet.panels[0] })}
{/if}
