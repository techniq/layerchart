<script lang="ts" module>
  export type { GeoPathProps } from './GeoPath.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { GeoPath as GeoPathCore } from 'layerchart/geo';
  import GeoPathWebGL from './GeoPath.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof GeoPathWebGL>;
  type CoreProps = ComponentProps<typeof GeoPathCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <GeoPathWebGL {...props} />
{:else}
  <GeoPathCore {...props as CoreProps} />
{/if}
