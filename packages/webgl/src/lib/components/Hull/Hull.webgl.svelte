<script lang="ts" module>
  import type { HullProps } from './Hull.shared.svelte.js';
</script>

<!-- LayerChart's `Hull`, drawn with these marks -->
<script lang="ts">
  import { HullBase } from 'layerchart/base';
  import GeoPath from '../GeoPath/GeoPath.webgl.svelte';
  import Group from '../Group/Group.webgl.svelte';
  import Spline from '../Spline/Spline.webgl.svelte';

  let props: HullProps = $props();
</script>

<HullBase {...props} {Group} {Spline} {GeoPath} />
