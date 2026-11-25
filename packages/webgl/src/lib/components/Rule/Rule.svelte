<script lang="ts" module>
  export type { RuleProps } from './Rule.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Rule as RuleCore } from 'layerchart';
  import RuleWebGL from './Rule.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof RuleWebGL>;
  type CoreProps = ComponentProps<typeof RuleCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <RuleWebGL {...props} />
{:else}
  <RuleCore {...props as CoreProps} />
{/if}
