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
  import { getChartContext } from '$lib/contexts/chart.js';

  // No `Axis` here on purpose — every layer renders a `<Facet>`, so importing it would put one of
  // the larger components in every chart's bundle.  The grid's headers are `<FacetAxis>`.

  let { children }: FacetProps = $props();

  const ctx = getChartContext();
</script>

{#if ctx.facet.enabled}
  {#each ctx.facet.panels as facet (facet.key)}
    <FacetPanel {facet} {children} />
  {/each}
{:else}
  <!-- Unfaceted charts pay nothing — no group, no wrapper -->
  {@render children?.({ facet: ctx.facet.panels[0] })}
{/if}
