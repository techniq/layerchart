<script lang="ts" module>
  import type { PieProps } from './Pie.shared.svelte.js';
</script>

<!-- LayerChart's `Pie`, drawn with these marks -->
<script lang="ts">
  import { PieBase } from 'layerchart/base';
  import Arc from '../Arc/Arc.webgl.svelte';

  let props: PieProps = $props();
</script>

<PieBase {...props} {Arc} />
