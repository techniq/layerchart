<script lang="ts" module>
  export type { SplineProps, SplinePropsWithoutHTML } from './Spline.shared.svelte.js';
</script>

<script lang="ts">
  import SplineBase from './Spline.base.svelte';
  import Path from '../Path/Path.svg.svelte';

  import type { SplineProps } from './Spline.shared.svelte.js';

  let props: SplineProps = $props();
</script>

<SplineBase {Path} {...props} />
