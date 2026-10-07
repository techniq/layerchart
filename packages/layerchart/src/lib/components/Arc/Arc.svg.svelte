<script lang="ts" module>
  export type { ArcProps, ArcPropsWithoutHTML } from './Arc.shared.svelte.js';
</script>

<script lang="ts">
  import ArcBase from './Arc.base.svelte';
  import Path from '../Path/Path.svg.svelte';
  import PathExtruded from '../Path/PathExtruded.svg.svelte';

  import type { ArcProps } from './Arc.shared.svelte.js';

  let props: ArcProps = $props();
</script>

<ArcBase Path={props.z != null ? PathExtruded : Path} {...props} />
