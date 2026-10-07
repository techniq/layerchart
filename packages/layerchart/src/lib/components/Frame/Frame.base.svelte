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
  import { getLayerIsometric } from '$lib/contexts/isometric.js';
  import { backWalls } from '$lib/utils/isometric.js';

  let { Rect, ref: refProp = $bindable(), full = false, ...restProps }: FrameBaseProps = $props();

  let ref = $state<SVGRectElement>();
  $effect.pre(() => {
    refProp = ref;
  });

  const ctx = getChartContext();
  const layerIsometric = getLayerIsometric();

  /**
   * On an `isometric` chart with a `z`, the walls standing on the floor's far edges, as tall as
   * the `z` range — the back of the box the data floats in.  Each is a rect with no depth, stood up
   * by `z` like any other.  Re-chosen as the view turns.
   */
  const walls = $derived.by(() => {
    if (!layerIsometric() || ctx.props.z == null || ctx.zDepth <= 0) return [];
    return backWalls({ width: ctx.width, height: ctx.height }, layerIsometric()!).map(
      ({ from, to }) => ({
        x: Math.min(from.x, to.x),
        y: Math.min(from.y, to.y),
        width: Math.abs(to.x - from.x),
        height: Math.abs(to.y - from.y),
      })
    );
  });

  const wallProps = $derived(extractLayerProps(restProps, 'lc-frame lc-frame-wall'));
</script>

{#each walls as wall}
  <!-- Unshaded: a wall's faint fill would gray under a darkened side -->
  <Rect {...wall} z={ctx.zDepth} shade={false} {...wallProps} />
{/each}

<Rect
  x={full && ctx.padding?.left ? -ctx.padding.left : 0}
  y={full && ctx.padding?.top ? -ctx.padding.top : 0}
  width={ctx.width + (full ? (ctx.padding?.left ?? 0) + (ctx.padding?.right ?? 0) : 0)}
  height={ctx.height + (full ? (ctx.padding?.top ?? 0) + (ctx.padding?.bottom ?? 0) : 0)}
  bind:ref
  {...extractLayerProps(restProps, 'lc-frame')}
/>
