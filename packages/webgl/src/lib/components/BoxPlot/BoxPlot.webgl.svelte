<script lang="ts" module>
  import type { BoxPlotProps } from './BoxPlot.shared.svelte.js';
</script>

<!-- LayerChart's `BoxPlot`, drawn with these marks -->
<script lang="ts">
  import { BoxPlotBase } from 'layerchart/base';
  import Group from '../Group/Group.webgl.svelte';
  import Rect from '../Rect/Rect.webgl.svelte';
  import Line from '../Line/Line.webgl.svelte';
  import Circle from '../Circle/Circle.webgl.svelte';

  let props: BoxPlotProps = $props();
</script>

<BoxPlotBase {...props} {Group} {Rect} {Line} {Circle} />
