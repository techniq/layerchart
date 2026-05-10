<script lang="ts" module>
  export type {
    ChartProps,
    ChartPropsWithoutHTML,
    ChartResizeDetail,
    PreservedChartConfig,
    LayerChartInternalMeta,
  } from './Chart.shared.svelte.js';
</script>

<script
  lang="ts"
  generics="TData = any, XScale extends AnyScale = AnyScale, YScale extends AnyScale = AnyScale"
>
  import ChartBase from './Chart.base.svelte';
  import ChartChildren from '../ChartChildren/ChartChildren.svg.svelte';

  import type { AnyScale } from '$lib/utils/scales.svelte.js';
  import type { ChartProps } from './Chart.shared.svelte.js';

  let {
    ref = $bindable(),
    context = $bindable(),
    ...props
  }: ChartProps<TData, XScale, YScale> = $props();
</script>

<ChartBase {ChartChildren} bind:ref bind:context {...props} />
