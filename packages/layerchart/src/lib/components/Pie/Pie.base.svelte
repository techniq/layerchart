<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { PieProps } from './Pie.shared.svelte.js';

  export type PieBaseLayerComponents = {
    Arc: Component<any>;
  };

  export type PieBaseProps = PieProps & PieBaseLayerComponents;
</script>

<script lang="ts">
  import { PieState } from './Pie.shared.svelte.js';

  let {
    Arc,
    data,
    range,
    startAngle,
    endAngle,
    innerRadius,
    outerRadius,
    cornerRadius = 0,
    padAngle = 0,
    motion,
    offset = 0,
    tooltip,
    sort,
    children,
  }: PieBaseProps = $props();

  const c = new PieState(
    () =>
      ({
        data,
        range,
        startAngle,
        endAngle,
        innerRadius,
        outerRadius,
        cornerRadius,
        padAngle,
        motion,
        offset,
        tooltip,
        sort,
      }) as PieProps
  );
</script>

{#if children}
  {@render children({ arcs: c.arcs })}
{:else}
  {#each c.arcs as arc}
    <Arc
      class="lc-pie-arc"
      startAngle={arc.startAngle}
      endAngle={arc.endAngle}
      padAngle={arc.padAngle}
      {innerRadius}
      {outerRadius}
      {cornerRadius}
      {offset}
      fill={c.ctx.config.c ? c.ctx.cScale?.(c.ctx.c(arc.data)) : null}
      data={arc.data}
      {tooltip}
    />
  {/each}
{/if}
