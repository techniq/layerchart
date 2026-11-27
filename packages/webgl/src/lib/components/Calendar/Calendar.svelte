<script lang="ts" module>
  export type { CalendarProps } from './Calendar.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Calendar as CalendarCore } from 'layerchart';
  import CalendarWebGL from './Calendar.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof CalendarWebGL>;
  type CoreProps = ComponentProps<typeof CalendarCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <CalendarWebGL {...props} />
{:else}
  <CalendarCore {...props as CoreProps} />
{/if}
