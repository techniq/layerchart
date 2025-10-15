<script lang="ts" module>
  import type { ComponentProps, Snippet } from 'svelte';

  export type CanvasLayerProps = {
    type: 'canvas';
  } & Omit<ComponentProps<typeof Canvas>, 'type' | 'onpointermove'>;

  export type HtmlLayerProps = {
    type: 'html';
  } & Omit<ComponentProps<typeof Html>, 'type' | 'onpointermove'>;

  export type SvgLayerProps = {
    type: 'svg';
  } & Omit<ComponentProps<typeof Svg>, 'type' | 'onpointermove'>;

  export type DefaultLayerProps = {
    type?: undefined;
    children: Snippet;
  };

  export type LayerProps = (
    | CanvasLayerProps
    | HtmlLayerProps
    | SvgLayerProps
    | DefaultLayerProps
  ) & {
    onpointermove?: (e: PointerEvent) => void;
  };
</script>

<script lang="ts">
  import Canvas from './Canvas.svelte';
  import Html from './Html.svelte';
  import Svg from './Svg.svelte';
  import { getSettings } from '$lib/contexts/settings.js';
  import { Frame } from '../index.js';

  let { type, children, ...restProps }: LayerProps = $props();

  let settings = getSettings();
  let layer = $derived(type ?? settings.layer);
</script>

{#if layer === 'canvas'}
  <Canvas {...restProps as ComponentProps<typeof Canvas>}>
    {#snippet children(props)}
      {#if settings.debug}
        <Frame class="fill-danger/5" />
        <Frame class="fill-danger/5" full />
      {/if}

      {@render children?.(props)}
    {/snippet}
  </Canvas>
{:else if layer === 'svg'}
  <Svg {...restProps as ComponentProps<typeof Svg>}>
    {#snippet children(props)}
      {#if settings.debug}
        <Frame class="fill-danger/5" />
        <Frame class="fill-danger/5" full />
      {/if}

      {@render children?.(props)}
    {/snippet}
  </Svg>
{:else if layer === 'html'}
  <Html {...restProps as ComponentProps<typeof Html>}>
    {#snippet children(props)}
      {#if settings.debug}
        <Frame class="fill-danger/5" />
        <Frame class="fill-danger/5" full />
      {/if}

      {@render children?.(props)}
    {/snippet}
  </Html>
{/if}
