<script lang="ts">
  import type { GeoCircleProps } from 'layerchart/geo';
  import { GeoCircleBase } from 'layerchart/base';
  import GeoPath from '../GeoPath/GeoPath.svelte';

  let props: GeoCircleProps = $props();
</script>

<!-- LayerChart's `GeoCircle`, drawn with the `GeoPath` here -->
<GeoCircleBase {GeoPath} {...props} />
