<script lang="ts" module>
  export type { LabelsProps } from './Labels.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Labels as LabelsCore } from 'layerchart';
  import LabelsWebGL from './Labels.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof LabelsWebGL>;
  type CoreProps = ComponentProps<typeof LabelsCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <LabelsWebGL {...props} />
{:else}
  <LabelsCore {...props as CoreProps} />
{/if}
