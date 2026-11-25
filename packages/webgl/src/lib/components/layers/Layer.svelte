<script lang="ts" module>
  import type { LayerProps as CoreLayerProps } from 'layerchart';
  import type { WebGLProps } from './WebGL.svelte';

  /**
   * LayerChart's `Layer`, plus `type="webgl"`: a `<WebGL>` scene.  With no `type`, the layer
   * is the one in the chart's settings (`settings.layer`), `webgl` included.
   */
  export type LayerProps = CoreLayerProps | ({ type?: 'webgl' } & WebGLProps);
</script>

<script lang="ts">
  import { getSettings, Layer as CoreLayer } from 'layerchart';
  import WebGL from './WebGL.svelte';

  let props: LayerProps = $props();

  const settings = getSettings();
  const layer = $derived(props.type ?? settings.layer);
</script>

{#if layer === 'webgl'}
  {@const { type: _, ...rest } = props as { type?: 'webgl' } & WebGLProps}
  <WebGL {...rest} />
{:else}
  <CoreLayer {...{ ...props, type: layer } as CoreLayerProps} />
{/if}
