<script lang="ts" module>
  export type { ArcProps, ArcPropsWithoutHTML } from './Arc.shared.svelte.js';
</script>

<script lang="ts">
  import ArcBase from './Arc.base.svelte';
  import Path from '../Path/Path.canvas.svelte';

  import type { ArcProps } from './Arc.shared.svelte.js';

  let props: ArcProps = $props();
</script>

<ArcBase {Path} {...props} />
