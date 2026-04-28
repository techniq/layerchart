<script lang="ts" module>
  export type { ChartChildrenProps } from './ChartChildren.shared.svelte.js';
</script>

<script
  lang="ts"
  generics="TData = any, XScale extends AnyScale = AnyScale, YScale extends AnyScale = AnyScale"
>
  import ChartChildrenBase from './ChartChildren.base.svelte';
  import Layer from '../layers/Html.svelte';
  import Axis from '../Axis/Axis.html.svelte';
  import Grid from '../Grid/Grid.html.svelte';
  import Rule from '../Rule/Rule.html.svelte';
  import Highlight from '../Highlight/Highlight.html.svelte';
  import ChartClipPath from '../ChartClipPath/ChartClipPath.html.svelte';

  import type { AnyScale } from '$lib/utils/scales.svelte.js';
  import type { ChartChildrenProps } from './ChartChildren.shared.svelte.js';

  let props: ChartChildrenProps<TData, XScale, YScale> = $props();
</script>

<ChartChildrenBase {Layer} {Axis} {Grid} {Rule} {Highlight} {ChartClipPath} {...props} />
