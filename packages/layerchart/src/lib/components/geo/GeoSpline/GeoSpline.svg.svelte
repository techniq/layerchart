<script lang="ts" module>
  export type { GeoSplineProps, GeoSplinePropsWithoutHTML } from './GeoSpline.shared.svelte.js';
</script>

<script lang="ts">
  import GeoSplineBase from './GeoSpline.base.svelte';
  import Path from '../../Path/Path.svg.svelte';
  import type { GeoSplineProps } from './GeoSpline.shared.svelte.js';

  let props: GeoSplineProps = $props();
</script>

<GeoSplineBase {Path} {...props} />
