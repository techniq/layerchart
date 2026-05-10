<script lang="ts" module>
  export type {
    ArcLabelProps,
    ArcLabelConfig,
    ArcLabelPlacement,
  } from './ArcLabel.shared.svelte.js';
</script>

<script lang="ts">
  import ArcLabelBase from './ArcLabel.base.svelte';
  import Path from '../Path/Path.canvas.svelte';
  import Text from '../Text/Text.canvas.svelte';

  import type { ArcLabelProps } from './ArcLabel.shared.svelte.js';

  let props: ArcLabelProps = $props();
</script>

<ArcLabelBase {Path} {Text} {...props} />
