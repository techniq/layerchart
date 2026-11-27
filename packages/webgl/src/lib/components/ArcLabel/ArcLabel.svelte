<script lang="ts" module>
  export type { ArcLabelProps } from 'layerchart';
</script>

<script lang="ts">
  import { ArcLabelBase } from 'layerchart/base';
  import type { ArcLabelProps } from 'layerchart';
  import Path from '../Path/Path.svelte';
  import Text from '../Text/Text.svelte';

  let props: ArcLabelProps = $props();
</script>

<!-- LayerChart's `ArcLabel`, drawn with the marks here -->
<ArcLabelBase {Path} {Text} {...props} />
