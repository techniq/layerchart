<script lang="ts" module>
  export type { ContourProps, ContourPropsWithoutHTML } from './Contour.shared.svelte.js';
</script>

<script lang="ts">
  import ContourBase from './Contour.base.svelte';
  import Group from '../Group/Group.canvas.svelte';
  import Path from '../Path/Path.canvas.svelte';
  import type { ContourProps } from './Contour.shared.svelte.js';

  let props: ContourProps = $props();
</script>

<ContourBase {Group} {Path} {...props} />
