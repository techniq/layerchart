<script lang="ts" module>
  export type { AreaProps, AreaPropsWithoutHTML } from './Area.shared.svelte.js';
</script>

<script lang="ts">
  import AreaBase from './Area.base.svelte';
  import Path from '../Path/Path.canvas.svelte';
  import Spline from '../Spline/Spline.canvas.svelte';

  import type { AreaProps } from './Area.shared.svelte.js';

  let props: AreaProps = $props();
</script>

<AreaBase {Path} {Spline} {...props} />
