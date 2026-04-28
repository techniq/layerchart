<script lang="ts" module>
  export type { ChartChildrenProps } from './ChartChildren.shared.svelte.js';
</script>

<script
  lang="ts"
  generics="TData = any, XScale extends AnyScale = AnyScale, YScale extends AnyScale = AnyScale"
>
  import ChartChildrenBase from './ChartChildren.base.svelte';
  import Layer from '../layers/Canvas.svelte';
  import Axis from '../Axis/Axis.canvas.svelte';
  import Grid from '../Grid/Grid.canvas.svelte';
  import Rule from '../Rule/Rule.canvas.svelte';

  import type { AnyScale } from '$lib/utils/scales.svelte.js';
  import type { ChartChildrenProps } from './ChartChildren.shared.svelte.js';

  let props: ChartChildrenProps<TData, XScale, YScale> = $props();
</script>

<ChartChildrenBase {Layer} {Axis} {Grid} {Rule} {...props} />
