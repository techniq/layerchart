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
  import { getChartContext, getSettings, Layer as CoreLayer } from 'layerchart';
  import { FacetPanelBase } from 'layerchart/base';
  import WebGL from './WebGL.svelte';
  import Group from '../Group/Group.webgl.svelte';

  let props: LayerProps = $props();

  const settings = getSettings();
  const ctx = getChartContext();
  const layer = $derived(props.type ?? settings.layer);
</script>

<!--
  What's inside drawn once per facet panel, moved into place, with the panel it's in (as the core
  layers draw it): marks draw that panel's rows.  Unfaceted, the one panel covering the plot.
-->
{#snippet panels(children: any)}
  {#if ctx.facet.enabled}
    {#each ctx.facet.panels as facet (facet.key)}
      <FacetPanelBase {facet} {children} {Group} />
    {/each}
  {:else}
    {@render children?.({ facet: ctx.facet.panels[0] })}
  {/if}
{/snippet}

{#if layer === 'webgl'}
  {@const {
    type: _,
    center,
    children,
    ...rest
  } = props as { type?: 'webgl'; center?: boolean | 'x' | 'y' } & WebGLProps}
  <!-- `center`, as the core layers take it: what's inside placed about the plot's center -->
  <WebGL {...rest}>
    {#if center}
      <Group {center}>{@render panels(children)}</Group>
    {:else}
      {@render panels(children)}
    {/if}
  </WebGL>
{:else}
  <CoreLayer {...{ ...props, type: layer } as CoreLayerProps} />
{/if}
