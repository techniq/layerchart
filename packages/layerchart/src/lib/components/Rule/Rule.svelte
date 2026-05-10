<script lang="ts" module>
  export type { RuleProps, RulePropsWithoutHTML } from './Rule.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import RuleSvg from './Rule.svg.svelte';
  import RuleCanvas from './Rule.canvas.svelte';
  import RuleHtml from './Rule.html.svelte';
  import type { RuleProps } from './Rule.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: RuleProps = $props();
</script>

{#if layerCtx === 'svg'}
  <RuleSvg {...props} />
{:else if layerCtx === 'canvas'}
  <RuleCanvas {...props} />
{:else if layerCtx === 'html'}
  <RuleHtml {...props} />
{/if}
