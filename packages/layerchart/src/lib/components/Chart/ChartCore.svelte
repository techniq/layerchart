<script lang="ts" module>
  export type {
    ChartProps,
    ChartPropsWithoutHTML,
    ChartResizeDetail,
    PreservedChartConfig,
    LayerChartInternalMeta,
  } from './Chart.shared.svelte.js';
</script>

<!--
  Bare-bones chart wrapper — provides chart context, tooltip, brush, transform,
  but skips `ChartChildren` (and therefore `Layer` / `Axis` / `Grid` / `Rule` /
  `Highlight` / `ChartClipPath` / `RectClipPath`).

  Use this for geo charts or other compositions that render their own primitives
  directly via the `children` snippet, without the standard cartesian chart frame.
  Saves ~20–30 KB gz over `<Chart>` for non-cartesian use cases.
-->
<script
  lang="ts"
  generics="TData = any, XScale extends AnyScale = AnyScale, YScale extends AnyScale = AnyScale"
>
  import ChartBase from './Chart.base.svelte';

  import type { AnyScale } from '$lib/utils/scales.svelte.js';
  import type { ChartProps } from './Chart.shared.svelte.js';

  let {
    ref = $bindable(),
    context = $bindable(),
    ...props
  }: ChartProps<TData, XScale, YScale> = $props();
</script>

<ChartBase bind:ref bind:context {...props} />
