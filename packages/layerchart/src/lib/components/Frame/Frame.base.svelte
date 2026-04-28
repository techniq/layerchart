<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { FrameProps } from './Frame.shared.svelte.js';

  export type FrameBaseLayerComponents = {
    Rect: Component<any>;
  };

  export type FrameBaseProps = FrameProps & FrameBaseLayerComponents;
</script>

<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  let {
    Rect,
    ref: refProp = $bindable(),
    full = false,
    ...restProps
  }: FrameBaseProps = $props();

  let ref = $state<SVGRectElement>();
  $effect.pre(() => {
    refProp = ref;
  });

  const ctx = getChartContext();
</script>

<Rect
  x={full && ctx.padding?.left ? -ctx.padding.left : 0}
  y={full && ctx.padding?.top ? -ctx.padding.top : 0}
  width={ctx.width + (full ? (ctx.padding?.left ?? 0) + (ctx.padding?.right ?? 0) : 0)}
  height={ctx.height + (full ? (ctx.padding?.top ?? 0) + (ctx.padding?.bottom ?? 0) : 0)}
  bind:ref
  {...extractLayerProps(restProps, 'lc-frame')}
/>
