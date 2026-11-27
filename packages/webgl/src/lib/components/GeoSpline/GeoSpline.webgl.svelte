<script lang="ts">
  import type { GeoSplineProps } from 'layerchart/geo';
  import { GeoSplineBase } from 'layerchart/base';
  import Path from '../Path/Path.svelte';

  let props: GeoSplineProps = $props();
</script>

<!-- LayerChart's `GeoSpline`, drawn with the `Path` here -->
<GeoSplineBase {Path} {...props} />
