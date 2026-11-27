<script lang="ts" module>
  export type { LineProps } from './Line.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Line as LineCore } from 'layerchart';
  import LineWebGL from './Line.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof LineWebGL>;
  type CoreProps = ComponentProps<typeof LineCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <LineWebGL {...props} />
{:else}
  <LineCore {...props as CoreProps} />
{/if}
