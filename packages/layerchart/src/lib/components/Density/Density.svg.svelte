<script lang="ts" module>
  export type { DensityProps, DensityPropsWithoutHTML } from './Density.shared.svelte.js';
</script>

<script lang="ts">
  import DensityBase from './Density.base.svelte';
  import Group from '../Group/Group.svg.svelte';
  import Path from '../Path/Path.svg.svelte';
  import type { DensityProps } from './Density.shared.svelte.js';

  let props: DensityProps = $props();
</script>

<DensityBase {Group} {Path} {...props} />
