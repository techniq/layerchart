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
    children?: Snippet;
  };
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getRenderContext } from './Chart.svelte';
  import { createId } from '$lib/utils/createId.js';

  const uid = $props.id();

  let { id = createId('blur-', uid), stdDeviation = 5, children }: BlurProps = $props();

  const renderContext = getRenderContext();
</script>

{#if renderContext === 'svg'}
  <defs>
    <filter {id} class="lc-blur-filter">
      <feGaussianBlur in="SourceGraphic" {stdDeviation} />
    </filter>
  </defs>

  {#if children}
    <g filter="url(#{id})" class="lc-blur-g">
      {@render children()}
    </g>
  {/if}
{:else if children}
  {@render children()}
{/if}
