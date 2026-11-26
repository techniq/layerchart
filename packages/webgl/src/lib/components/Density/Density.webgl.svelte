<script lang="ts" module>
  import type { DensityProps } from './Density.shared.svelte.js';
</script>

<!-- LayerChart's `Density`, drawn with these marks -->
<script lang="ts">
  import { DensityBase } from 'layerchart/base';
  import Group from '../Group/Group.webgl.svelte';
  import Path from '../Path/Path.webgl.svelte';

  let props: DensityProps = $props();
</script>

<DensityBase {...props} {Group} {Path} />
