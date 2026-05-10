<script lang="ts" module>
  // Re-export so existing `import type { RectProps } from 'layerchart'` keeps working.
  export type {
    RectProps,
    RectPropsWithoutHTML,
  } from './Rect.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import RectSvg from './Rect.svg.svelte';
  import RectCanvas from './Rect.canvas.svelte';
  import RectHtml from './Rect.html.svelte';
  import type { RectProps } from './Rect.shared.svelte.js';

  const layerCtx = getLayerContext();

  let { ref = $bindable(), ...rest }: RectProps = $props();
</script>

{#if layerCtx === 'svg'}
  <RectSvg bind:ref {...rest} />
{:else if layerCtx === 'canvas'}
  <RectCanvas {...rest} />
{:else if layerCtx === 'html'}
  <RectHtml {...rest} />
{/if}
