<script lang="ts" module>
  export type { ThresholdProps, ThresholdSnippetProps } from './Threshold.shared.svelte.js';
</script>

<script lang="ts">
  import ThresholdBase from './Threshold.base.svelte';
  import Area from '../Area/Area.svg.svelte';
  import ClipPath from '../ClipPath/ClipPath.svg.svelte';
  import type { ThresholdProps } from './Threshold.shared.svelte.js';

  let props: ThresholdProps = $props();
</script>

<ThresholdBase {Area} {ClipPath} {...props} />
