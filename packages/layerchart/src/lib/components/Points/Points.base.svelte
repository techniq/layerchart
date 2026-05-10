<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { PointsProps } from './Points.shared.svelte.js';

  export type PointsBaseLayerComponents = {
    Circle: Component<any>;
  };

  export type PointsBaseProps = PointsProps & PointsBaseLayerComponents;
</script>

<script lang="ts">
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { PointsState } from './Points.shared.svelte.js';

  let {
    Circle,
    data,
    x,
    y,
    seriesKey,
    r = 5,
    offsetX,
    offsetY,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    opacity,
    children,
    ...restProps
  }: PointsBaseProps = $props();

  const c = new PointsState(
    () =>
      ({
        data,
        x,
        y,
        seriesKey,
        r,
        offsetX,
        offsetY,
        fill,
        fillOpacity,
        stroke,
        strokeWidth,
        opacity,
      }) as PointsProps
  );
</script>

{#if children}
  {@render children({ points: c.points })}
{:else}
  {#each c.points as point}
    <Circle
      cx={point.x}
      cy={point.y}
      r={point.r}
      fill={fill ?? c.series?.color ?? (c.ctx.config.c ? c.ctx.cGet(point.data) : null)}
      {fillOpacity}
      {stroke}
      {strokeWidth}
      opacity={opacity ??
        (c.series?.key == null ||
        c.ctx.series.visibleSeries.length <= 1 ||
        c.ctx.series.isHighlighted(c.series.key, true)
          ? 1
          : 0.1)}
      {...c.series?.props}
      {...extractLayerProps(restProps, 'lc-point')}
    />
  {/each}
{/if}
