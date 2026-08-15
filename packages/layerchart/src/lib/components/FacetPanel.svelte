<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { Facet } from '$lib/states/facet.svelte.js';

  export type FacetPanelProps = {
    facet: Facet;
    children?: Snippet<[{ facet: Facet }]>;
  };
</script>

<script lang="ts">
  import Group from './Group/Group.svelte';
  import { setFacetPanel } from '$lib/contexts/facet.js';

  let { facet, children }: FacetPanelProps = $props();

  // Marks read this (via `getMarkData`) to draw this panel's rows, and `Axis` to tell whether it's
  // on the grid's outer edge.  Set once at init against a getter, since context can't be assigned
  // later but `facet` changes as the data does.
  setFacetPanel(() => facet);
</script>

<Group x={facet.x} y={facet.y}>
  {@render children?.({ facet })}
</Group>
