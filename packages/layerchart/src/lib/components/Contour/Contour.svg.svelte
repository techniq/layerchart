<script lang="ts" module>
  export type { ContourProps, ContourPropsWithoutHTML } from './Contour.shared.svelte.js';
</script>

<script lang="ts">
  import ContourBase from './Contour.base.svelte';
  import Group from '../Group/Group.svg.svelte';
  import Path from '../Path/Path.svg.svelte';
  import PathExtruded from '../Path/PathExtruded.svg.svelte';
  import type { ContourProps } from './Contour.shared.svelte.js';

  let props: ContourProps = $props();
</script>

<ContourBase {Group} Path={props.z != null ? PathExtruded : Path} {...props} />
