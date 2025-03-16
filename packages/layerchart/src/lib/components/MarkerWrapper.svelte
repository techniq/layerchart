<script lang="ts" module>
  import Marker from './Marker.svelte';
  import type { ComponentProps, Snippet } from 'svelte';

  export type MarkerOptions =
    | ComponentProps<typeof Marker>['type']
    | ComponentProps<typeof Marker>
    | Snippet<[{ id: string }]>;
</script>

<script lang="ts">
  let {
    id,
    marker,
  }: {
    id: string;
    marker?: MarkerOptions;
  } = $props();
</script>

{#if typeof marker === 'function'}
  {@render marker({ id })}
{:else if marker}
  <Marker
    {id}
    type={typeof marker === 'string' ? marker : undefined}
    {...typeof marker === 'object' ? marker : null}
  />
{/if}
