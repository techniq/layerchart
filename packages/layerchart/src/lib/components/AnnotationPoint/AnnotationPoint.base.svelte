<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { AnnotationPointProps } from './AnnotationPoint.shared.svelte.js';

  export type AnnotationPointBaseLayerComponents = {
    Circle: Component<any>;
    Link: Component<any>;
    Text: Component<any>;
  };

  export type AnnotationPointBaseProps = AnnotationPointProps &
    AnnotationPointBaseLayerComponents;
</script>

<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import { isScaleBand } from '$lib/utils/scales.svelte.js';
  import { cls } from '@layerstack/tailwind';

  let {
    Circle,
    Link,
    Text,
    x,
    y,
    r = 4,
    label,
    labelPlacement = 'center',
    labelXOffset = 0,
    labelYOffset = 0,
    link,
    details,
    props,
  }: AnnotationPointBaseProps = $props();

  const ctx = getChartContext();
  const geo = getGeoContext();

  const point = $derived.by(() => {
    if (geo.projection && typeof x === 'number' && typeof y === 'number') {
      const [px, py] = geo.projection([x, y]) ?? [0, 0];
      return { x: px, y: py };
    }
    return {
      x: x ? ctx.xScale(x) + (isScaleBand(ctx.xScale) ? ctx.xScale.bandwidth() / 2 : 0) : 0,
      y: y
        ? ctx.yScale(y) + (isScaleBand(ctx.yScale) ? ctx.yScale.bandwidth() / 2 : 0)
        : ctx.height,
    };
  });

  const labelProps = $derived.by(() => {
    const dirX = labelPlacement.includes('left') ? -1 : labelPlacement.includes('right') ? 1 : 0;
    const dirY = labelPlacement.includes('top') ? -1 : labelPlacement.includes('bottom') ? 1 : 0;
    const mag = Math.hypot(dirX, dirY) || 1;
    const signX = labelPlacement.includes('left') ? -1 : 1;
    const signY = labelPlacement.includes('top') ? -1 : 1;

    return {
      x: point.x + (r * dirX) / mag + labelXOffset * signX,
      y: point.y + (r * dirY) / mag + labelYOffset * signY,
      dy: -2,
      textAnchor: labelPlacement.includes('left')
        ? 'end'
        : labelPlacement.includes('right')
          ? 'start'
          : 'middle',
      verticalAnchor: labelPlacement.includes('top')
        ? 'end'
        : labelPlacement.includes('bottom')
          ? 'start'
          : 'middle',
    };
  });

  const linkEndpoints = $derived.by(() => {
    if (!link) return null;

    const dirX = labelPlacement.includes('left') ? -1 : labelPlacement.includes('right') ? 1 : 0;
    const dirY = labelPlacement.includes('top') ? -1 : labelPlacement.includes('bottom') ? 1 : 0;
    if (dirX === 0 && dirY === 0) return null;

    const mag = Math.hypot(dirX, dirY);
    return {
      source: { x: point.x + (r * dirX) / mag, y: point.y + (r * dirY) / mag },
      target: { x: labelProps.x as number, y: labelProps.y as number },
    };
  });

  const linkProps = $derived(typeof link === 'object' ? link : {});

  function onPointerMove(e: PointerEvent | MouseEvent | TouchEvent) {
    if (details) {
      e.stopPropagation();
      ctx.tooltip.show(e, { annotation: { label, details } });
    }
  }

  function onPointerLeave(e: PointerEvent | MouseEvent | TouchEvent) {
    if (details) {
      e.stopPropagation();
      ctx.tooltip.hide();
    }
  }
</script>

<Circle
  cx={point.x}
  cy={point.y}
  {r}
  onpointermove={onPointerMove}
  onmousemove={onPointerMove}
  ontouchmove={onPointerMove}
  onpointerleave={onPointerLeave}
  onmouseleave={onPointerLeave}
  ontouchend={onPointerLeave}
  {...props?.circle}
  class={cls('lc-annotation-point', link && 'lc-annotation-point-ring', props?.circle?.class)}
/>

{#if linkEndpoints}
  <Link
    x1={linkEndpoints.source.x}
    y1={linkEndpoints.source.y}
    x2={linkEndpoints.target.x}
    y2={linkEndpoints.target.y}
    type="straight"
    {...linkProps}
    class={cls(
      'lc-annotation-point-link',
      typeof linkProps.class === 'string' ? linkProps.class : undefined
    )}
  />
{/if}

{#if label}
  <Text
    value={label}
    {...labelProps}
    {...props?.label}
    class={cls('lc-annotation-point-label', props?.label?.class)}
  />
{/if}

<style>
  @layer components {
    :global(:where(.lc-annotation-point-label)) {
      font-size: 12px;
      pointer-events: none;
    }

    :global(:where(.lc-annotation-point-ring)) {
      --fill-color: none;
      --stroke-color: var(--color-surface-content, currentColor);
    }

    :global(:where(.lc-annotation-point-link)) {
      --stroke-color: var(--color-surface-content, currentColor);
      fill: none;
      pointer-events: none;
    }
  }
</style>
