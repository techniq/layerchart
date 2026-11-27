<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { ChartChildrenBase } from 'layerchart/base';
  import Layer from '../layers/Layer.svelte';
  import Axis from '../Axis/Axis.svelte';
  import Grid from '../Grid/Grid.svelte';
  import Rule from '../Rule/Rule.svelte';
  import Highlight from '../Highlight/Highlight.svelte';
  import Points from '../Points/Points.svelte';
  import Labels from '../Labels/Labels.svelte';
  import ChartClipPath from '../ChartClipPath/ChartClipPath.svelte';
  import ChartAnnotations from './ChartAnnotations.svelte';
  import FacetAxis from '../FacetAxis/FacetAxis.svelte';

  type Props = Omit<
    ComponentProps<typeof ChartChildrenBase>,
    | 'Layer'
    | 'Axis'
    | 'Grid'
    | 'Rule'
    | 'Highlight'
    | 'ChartClipPath'
    | 'Points'
    | 'Labels'
    | 'ChartAnnotations'
    | 'FacetAxis'
  >;

  let props: Props = $props();
</script>

<!-- A chart's axes, grid, highlight, points, and labels, drawn in whichever layer it's in -->
<ChartChildrenBase
  {Layer}
  {Axis}
  {Grid}
  {Rule}
  {Highlight}
  {ChartClipPath}
  {Points}
  {Labels}
  {ChartAnnotations}
  {FacetAxis}
  {...props}
/>
