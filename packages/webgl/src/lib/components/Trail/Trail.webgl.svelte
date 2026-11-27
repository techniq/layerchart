<script lang="ts" module>
  import type { TrailProps } from './Trail.shared.svelte.js';
</script>

<!-- LayerChart's `Trail`, drawn with these marks -->
<script lang="ts">
  import { TrailBase } from 'layerchart/base';
  import Path from '../Path/Path.webgl.svelte';

  let props: TrailProps = $props();
</script>

<TrailBase {...props} {Path} />
