<script lang="ts" module>
  export type { ChartChildrenProps } from './ChartChildren.shared.svelte.js';
</script>

<script
  lang="ts"
  generics="TData = any, XScale extends AnyScale = AnyScale, YScale extends AnyScale = AnyScale"
>
  import ChartChildrenBase from './ChartChildren.base.svelte';
  import Layer from '../layers/Layer.svelte';
  import Axis from '../Axis/Axis.svelte';
  import Grid from '../Grid/Grid.svelte';
  import Rule from '../Rule/Rule.svelte';
  import Highlight from '../Highlight/Highlight.svelte';
  import ChartClipPath from '../ChartClipPath/ChartClipPath.svelte';

  import type { AnyScale } from '$lib/utils/scales.svelte.js';
  import type { ChartChildrenProps } from './ChartChildren.shared.svelte.js';

  let props: ChartChildrenProps<TData, XScale, YScale> = $props();
</script>

<ChartChildrenBase {Layer} {Axis} {Grid} {Rule} {Highlight} {ChartClipPath} {...props} />
