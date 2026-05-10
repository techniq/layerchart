<script lang="ts" module>
  export type {
    EllipseProps,
    EllipsePropsWithoutHTML,
  } from './Ellipse.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import EllipseSvg from './Ellipse.svg.svelte';
  import EllipseCanvas from './Ellipse.canvas.svelte';
  import EllipseHtml from './Ellipse.html.svelte';
  import type { EllipseProps } from './Ellipse.shared.svelte.js';

  const layerCtx = getLayerContext();

  let { ref = $bindable(), ...rest }: EllipseProps = $props();
</script>

{#if layerCtx === 'svg'}
  <EllipseSvg bind:ref {...rest} />
{:else if layerCtx === 'canvas'}
  <EllipseCanvas {...rest} />
{:else if layerCtx === 'html'}
  <EllipseHtml {...rest} />
{/if}
