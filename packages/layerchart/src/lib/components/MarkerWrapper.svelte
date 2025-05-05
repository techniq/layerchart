<script lang="ts" module>
  import Marker from './Marker.svelte';
  import type { ComponentProps, Snippet } from 'svelte';

  export type MarkerProps = {
    /**
     * A unique identifier for the marker.
     */
    id: string;

    /**
     * The marker or marker options to render
     */
    marker?: MarkerOptions;
  };

  export type MarkerOptions =
    | ComponentProps<typeof Marker>['type']
    | ComponentProps<typeof Marker>
    | Snippet<[{ id: string }]>;
</script>

<script lang="ts">
  let { id, marker }: MarkerProps = $props();
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
