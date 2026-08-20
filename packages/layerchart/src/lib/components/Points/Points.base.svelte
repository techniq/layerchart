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

  /**
   * Faded when something else is highlighted — the row's `c` category when the legend names
   * those, and the point's series otherwise.  A single series names nothing to tell apart, so it
   * never fades on its own account.
   */
  function highlightOpacity(d: any) {
    const category = c.ctx.cKey(d);
    if (category != null) {
      return c.ctx.series.isHighlighted(category, true) ? 1 : 0.1;
    }
    return c.series?.key == null ||
      c.ctx.series.visibleSeries.length <= 1 ||
      c.ctx.series.isHighlighted(c.series.key, true)
      ? 1
      : 0.1;
  }
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
      opacity={opacity ?? highlightOpacity(point.data)}
      {...c.series?.props}
      {...extractLayerProps(restProps, 'lc-point')}
    />
  {/each}
{/if}
