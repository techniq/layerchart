<script lang="ts" module>
  // Re-export so existing `import type { LineProps } from 'layerchart'` keeps working.
  export type {
    LineProps,
    LinePropsWithoutHTML,
  } from './Line.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import LineSvg from './Line.svg.svelte';
  import LineCanvas from './Line.canvas.svelte';
  import LineHtml from './Line.html.svelte';
  import type { LineProps } from './Line.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: LineProps = $props();
</script>

{#if layerCtx === 'svg'}
  <LineSvg {...props} />
{:else if layerCtx === 'canvas'}
  <LineCanvas {...props} />
{:else if layerCtx === 'html'}
  <LineHtml {...props} />
{/if}
