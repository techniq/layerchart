<!--
  @component
  `Grid z` on an `isometric` floor: gridlines across the back walls at each height, and the floor's
  gridlines carried up them.  Part of the `isometric` view, so flat charts don't bundle it.
-->
<script lang="ts">
  import type { Component } from 'svelte';
  import { cls } from '@layerstack/tailwind';
  import { getLayerIsometric } from '$lib/contexts/isometric.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { backWalls } from '$lib/utils/isometric.js';
  import type { GridState } from './Grid.shared.svelte.js';

  let {
    Group,
    Line,
    grid,
    x,
    y,
    z,
    stroke,
    lineClass,
    transitionIn,
    transitionInParams,
  }: {
    Group: Component<any>;
    Line: Component<any>;
    grid: GridState;
    x: unknown;
    y: unknown;
    z: unknown;
    stroke?: string;
    lineClass?: string;
    transitionIn?: any;
    transitionInParams?: any;
  } = $props();

  const ctx = $derived(grid.ctx);
  const layerIsometric = getLayerIsometric();

  /** Every line, as its two ends raised off the floor */
  const lines = $derived.by(() => {
    const m = layerIsometric();
    const lift = ctx.isometricLift;
    const depth = ctx.zDepth;
    if (!m || !lift || ctx.props.z == null || depth <= 0) return [];
    const raise = (p: { x: number; y: number }, height: number) => ({
      x: p.x + lift.x * height,
      y: p.y + lift.y * height,
    });

    return backWalls({ width: ctx.width, height: ctx.height }, m).flatMap((edge) => [
      // Across the wall at each height
      ...grid.zTickVals.map((tick) => [
        raise(edge.from, ctx.zScale(tick)),
        raise(edge.to, ctx.zScale(tick)),
      ]),
      // Up the wall, continuing the floor's gridlines
      ...((edge.axis === 'x' ? x : y)
        ? (edge.axis === 'x' ? grid.xTickVals : grid.yTickVals).map((tick) => {
            const foot =
              edge.axis === 'x'
                ? { x: ctx.xScale(tick) + grid.xBandOffset, y: edge.from.y }
                : { x: edge.from.x, y: ctx.yScale(tick) + grid.yBandOffset };
            return [foot, raise(foot, depth)];
          })
        : []),
    ]);
  });

  const zProps = $derived(extractLayerProps(z, 'lc-grid-z-line'));
</script>

{#if lines.length}
  <Group {transitionIn} {transitionInParams} class="lc-grid-z">
    {#each lines as [a, b]}
      <Line
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        {stroke}
        {...zProps}
        class={cls('lc-grid-z-rule', lineClass, zProps?.class)}
      />
    {/each}
  </Group>
{/if}
