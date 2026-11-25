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

  let warnedWebGLFallback = false;

  /** Warn once a page that `webgl` is drawn as `canvas` by LayerChart's `Layer` */
  function warnWebGLFallback() {
    if (warnedWebGLFallback) return;
    warnedWebGLFallback = true;
    console.warn(
      "[LayerChart] LayerChart's `Layer` draws `webgl` as `canvas`. Import `Layer` (and its marks) from `@layerchart/webgl` to draw them with WebGL."
    );
  }

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
  import Canvas, { type CanvasProps } from './Canvas.svelte';
  import Svg, { type SVGProps } from './Svg.svelte';
  import Html, { type HTMLProps } from './Html.svelte';
  import Frame from '../Frame/Frame.svelte';
  import { getSettings } from '$lib/contexts/settings.js';
  import type { SettingsLayer } from '$lib/states/settings.svelte.js';

  let { type, children: childrenProp, ...restProps }: LayerProps = $props();

  let settings = getSettings();
  // `webgl` is `@layerchart/webgl`'s `Layer` to draw; LayerChart's marks draw in `canvas`, the
  // closest of its layers, instead.  It can come as a `type` too: `ChartChildren` passes
  // `settings.layer` on.
  let requested = $derived<SettingsLayer>(type ?? settings.layer);
  let layer = $derived(requested === 'webgl' ? 'canvas' : requested);

  $effect(() => {
    if (requested === 'webgl') warnWebGLFallback();
  });
</script>

{#if layer === 'canvas'}
  <Canvas {...restProps as CanvasProps}>
    {#snippet children(props)}
      {#if settings.debug}
        <Frame class="lc-debug-frame" />
        <Frame class="lc-debug-frame" full />
      {/if}

      {@render (childrenProp as CanvasProps['children'])?.(props)}
    {/snippet}
  </Canvas>
{:else if layer === 'svg'}
  <Svg {...restProps as SVGProps}>
    {#snippet children(props)}
      {#if settings.debug}
        <Frame class="lc-debug-frame" />
        <Frame class="lc-debug-frame" full />
      {/if}

      {@render (childrenProp as SVGProps['children'])?.(props)}
    {/snippet}
  </Svg>
{:else if layer === 'html'}
  <Html {...restProps as HTMLProps}>
    {#snippet children(props)}
      {#if settings.debug}
        <Frame class="lc-debug-frame" />
        <Frame class="lc-debug-frame" full />
      {/if}

      {@render (childrenProp as HTMLProps['children'])?.(props)}
    {/snippet}
  </Html>
{/if}

<style>
  @layer components {
    :global(:where(.lc-debug-frame)) {
      --fill-color: color-mix(in oklab, var(--color-danger) 10%, transparent);
    }
  }
</style>
