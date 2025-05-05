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
  import { createId } from '$lib/utils/createId.js';
  import { layerClass } from '$lib/utils/attributes.js';
  import type { Snippet } from 'svelte';
  const uid = $props.id();

  let { id = createId('blur-', uid), stdDeviation = 5, children }: BlurProps = $props();
</script>

<defs>
  <filter {id} class={layerClass('blur-filter')}>
    <feGaussianBlur in="SourceGraphic" {stdDeviation} />
  </filter>
</defs>

{#if children}
  <g filter="url(#{id})" class={layerClass('blur-g')}>
    {@render children({ id, url: `url(#${id})` })}
  </g>
{/if}
