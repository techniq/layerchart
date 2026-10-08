<script lang="ts" module>
  export type {
    ArcLabelProps,
    ArcLabelConfig,
    ArcLabelPlacement,
  } from './ArcLabel.shared.svelte.js';
</script>

<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';
  import ArcLabelBase from './ArcLabel.base.svelte';
  import Path from '../Path/Path.svg.svelte';
  import Text from '../Text/Text.svg.svelte';

  import type { ArcLabelProps } from './ArcLabel.shared.svelte.js';

  let props: ArcLabelProps = $props();
  // Stood up by `z` with the `isometric` view's own `Path`
  const ctx = getChartContext();
</script>

<ArcLabelBase Path={(props.z != null && ctx.isometric?.PathExtruded) || Path} {Text} {...props} />
