<script lang="ts" module>
  export type BlurProps = {
    /**
     * A unique id for the filter.
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
  import { createId } from 'layerchart/utils/createId.js';
  import type { Snippet } from 'svelte';
  const uid = $props.id();

  let { id = createId('blur-', uid), stdDeviation = 5, children }: BlurProps = $props();
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
