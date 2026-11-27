<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { Facet } from '$lib/states/facet.svelte.js';

  export type FacetPanelProps = {
    facet: Facet;
    children?: Snippet<[{ facet: Facet }]>;
  };
</script>

<script lang="ts">
  import FacetPanelBase from './FacetPanel.base.svelte';
  import Group from './Group/Group.svelte';

  let { facet, children }: FacetPanelProps = $props();
</script>

<FacetPanelBase {facet} {children} {Group} />
