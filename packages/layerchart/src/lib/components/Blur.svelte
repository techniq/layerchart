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
     * the id for the filter.
     */
    children?: Snippet<[{ id: string }]>;
  };
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getRenderContext } from './Chart.svelte';
  import { createId } from '$lib/utils/createId.js';
  import { layerClass } from '$lib/utils/attributes.js';

  const uid = $props.id();

  let { id = createId('blur-', uid), stdDeviation = 5, children }: BlurProps = $props();

  const renderContext = getRenderContext();
</script>

{#if renderContext === 'svg'}
  <defs>
    <filter {id} class={layerClass('blur-filter')}>
      <feGaussianBlur in="SourceGraphic" {stdDeviation} />
    </filter>
  </defs>

  {#if children}
    <g filter="url(#{id})" class={layerClass('blur-g')}>
      {@render children({ id })}
    </g>
  {/if}
{:else if children}
  {@render children({ id })}
{/if}
