<script lang="ts" module>
  import type { ComponentProps } from 'svelte';

  export type CanvasLayerProps = {
    type: 'canvas';
  } & Omit<ComponentProps<typeof Canvas>, 'type' | 'onpointermove'>;

  export type HtmlLayerProps = {
    type: 'html';
  } & Omit<ComponentProps<typeof Html>, 'type' | 'onpointermove'>;

  export type SvgLayerProps = {
    type: 'svg';
  } & Omit<ComponentProps<typeof Svg>, 'type' | 'onpointermove'>;

  export type LayerProps = (CanvasLayerProps | HtmlLayerProps | SvgLayerProps) & {
    onpointermove?: (e: PointerEvent) => void;
  };
</script>

<script lang="ts">
  import Canvas from './Canvas.svelte';
  import Html from './Html.svelte';
  import Svg from './Svg.svelte';

  let { type, children, onpointermove, ...restProps }: LayerProps = $props();
</script>

{#if type === 'canvas'}
  <Canvas {...restProps as ComponentProps<typeof Canvas>}>
    {@render children?.()}
  </Canvas>
{:else if type === 'svg'}
  <Svg {...restProps as ComponentProps<typeof Svg>}>
    {@render children?.()}
  </Svg>
{:else if type === 'html'}
  <Html {...restProps as ComponentProps<typeof Html>}>
    {@render children?.()}
  </Html>
{/if}
