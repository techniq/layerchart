<script lang="ts" module>
  // Re-export so existing `import type { PathProps } from 'layerchart'` keeps working.
  export type { PathProps, PathPropsWithoutHTML } from './Path.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import PathSvg from './Path.svg.svelte';
  import PathCanvas from './Path.canvas.svelte';
  import type { PathProps } from './Path.shared.svelte.js';

  const layerCtx = getLayerContext();

  let { pathRef = $bindable(), ...rest }: PathProps = $props();
</script>

{#if layerCtx === 'svg'}
  <PathSvg bind:pathRef {...rest} />
{:else if layerCtx === 'canvas'}
  <PathCanvas {...rest} />
{/if}
