<script lang="ts" module>
  export type { TrailProps, TrailPropsWithoutHTML } from './Trail.shared.svelte.js';
</script>

<script lang="ts">
  import TrailBase from './Trail.base.svelte';
  import Path from '../Path/Path.canvas.svelte';
  import type { TrailProps } from './Trail.shared.svelte.js';

  let props: TrailProps = $props();
</script>

<TrailBase {Path} {...props} />
