<script lang="ts" module>
  export type {
    GroupProps,
    GroupPropsWithoutHTML,
  } from './Group.shared.svelte.js';
</script>

<script lang="ts" generics="T extends import('$lib/utils/types.js').Transition = import('$lib/utils/types.js').Transition">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import GroupSvg from './Group.svg.svelte';
  import GroupCanvas from './Group.canvas.svelte';
  import GroupHtml from './Group.html.svelte';
  import type { GroupProps } from './Group.shared.svelte.js';

  const layerCtx = getLayerContext();

  let { ref = $bindable(), ...rest }: GroupProps<T> = $props();
</script>

{#if layerCtx === 'svg'}
  <GroupSvg bind:ref {...rest} />
{:else if layerCtx === 'canvas'}
  <GroupCanvas {...rest} />
{:else if layerCtx === 'html'}
  <GroupHtml bind:ref {...rest} />
{/if}
