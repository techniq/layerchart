<script lang="ts" module>
  export type { ThresholdProps, ThresholdSnippetProps } from './Threshold.shared.svelte.js';
</script>

<script lang="ts">
  import ThresholdBase from './Threshold.base.svelte';
  import Area from '../Area/Area.canvas.svelte';
  import ClipPath from '../ClipPath/ClipPath.canvas.svelte';
  import type { ThresholdProps } from './Threshold.shared.svelte.js';

  let props: ThresholdProps = $props();
</script>

<ThresholdBase {Area} {ClipPath} {...props} />
