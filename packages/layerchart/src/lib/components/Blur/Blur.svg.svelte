<script lang="ts" module>
  export type { BlurProps, BlurPropsWithoutHTML } from './Blur.shared.svelte.js';
</script>

<script lang="ts">
  import { createId } from '$lib/utils/createId.js';
  import type { BlurProps } from './Blur.shared.svelte.js';

  const uid = $props.id();

  let { id = createId('blur-', uid), stdDeviation = 5, children }: BlurProps = $props();
</script>

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
