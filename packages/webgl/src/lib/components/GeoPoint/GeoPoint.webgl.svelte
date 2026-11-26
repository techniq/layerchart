<script lang="ts" module>
  import type { GeoPointProps } from './GeoPoint.shared.svelte.js';
</script>

<!-- LayerChart's `GeoPoint`, drawn with these marks -->
<script lang="ts">
  import { GeoPointBase } from 'layerchart/base';
  import Circle from '../Circle/Circle.webgl.svelte';
  import Group from '../Group/Group.webgl.svelte';

  let props: GeoPointProps = $props();
</script>

<GeoPointBase {...props} {Circle} {Group} />
