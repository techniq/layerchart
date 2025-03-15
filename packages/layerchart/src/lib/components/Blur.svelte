<script lang="ts" module>
  export type BlurProps = {
    /**
     * A unique id for the filter.
     *
     * @default `uniqueId('blur-')`
     */
    id?: string;

    /**
     * The standard deviation for the blur effect.
     *
     * @default 5
     */
    stdDeviation?: number;

    /**
     * The default children snippet which provides
     * the id and url for the filter.
     */
    children?: Snippet<[{ id: string; url: string }]>;
  };
</script>

<script lang="ts">
  import { uniqueId } from '@layerstack/utils';
  import type { Snippet } from 'svelte';

  let { id = uniqueId('blur-'), stdDeviation = 5, children }: BlurProps = $props();
</script>

<defs>
  <filter {id}>
    <feGaussianBlur in="SourceGraphic" {stdDeviation} />
  </filter>
</defs>

{#if children}
  <g filter="url(#{id})">
    {@render children({ id, url: `url(#${id})` })}
  </g>
{/if}
