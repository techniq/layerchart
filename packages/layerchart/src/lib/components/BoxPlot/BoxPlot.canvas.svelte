<script lang="ts" module>
  export type { BoxPlotProps, BoxPlotPropsWithoutHTML } from './BoxPlot.shared.svelte.js';
</script>

<script lang="ts">
  import BoxPlotBase from './BoxPlot.base.svelte';
  import Group from '../Group/Group.canvas.svelte';
  import Rect from '../Rect/Rect.canvas.svelte';
  import Line from '../Line/Line.canvas.svelte';
  import Circle from '../Circle/Circle.canvas.svelte';
  import type { BoxPlotProps } from './BoxPlot.shared.svelte.js';

  let props: BoxPlotProps = $props();
</script>

<BoxPlotBase {Group} {Rect} {Line} {Circle} {...props} />
