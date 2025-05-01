<script lang="ts" module>
  import type { ComponentProps } from 'svelte';

  export type LayerProps<T extends 'canvas' | 'html' | 'svg' = 'svg'> = {
    /** Type of layer (Canvas, Svg, or Html)
     *
     * @default 'svg'
     */
    type?: T;
  } & (T extends 'canvas'
    ? ComponentProps<typeof Canvas>
    : T extends 'html'
      ? ComponentProps<typeof Html>
      : ComponentProps<typeof Svg>);
</script>

<script lang="ts" generics="T extends 'canvas' | 'html' | 'svg' = 'svg'">
  import Canvas from './Canvas.svelte';
  import Html from './Html.svelte';
  import Svg from './Svg.svelte';

  let { type = 'svg' as T, children, ...restProps }: LayerProps<T> = $props();
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
