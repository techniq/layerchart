<script lang="ts" module>
  import type { RibbonProps } from './Ribbon.shared.svelte.js';
</script>

<!-- LayerChart's `Ribbon`, drawn with these marks -->
<script lang="ts">
  import { RibbonBase } from 'layerchart/base';
  import Path from '../Path/Path.webgl.svelte';

  let props: RibbonProps = $props();
</script>

<RibbonBase {...props} {Path} />
