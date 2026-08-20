<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { AnnotationPointProps } from './AnnotationPoint.shared.svelte.js';

  export type AnnotationPointBaseLayerComponents = {
    Circle: Component<any>;
    /**
     * Used for callout link rendering. Optional because the HTML layer
     * doesn't have a `Link` variant; HTML annotation points without callouts
     * still render correctly.
     */
    Link?: Component<any>;
    Text: Component<any>;
  };

  export type AnnotationPointBaseProps = AnnotationPointProps & AnnotationPointBaseLayerComponents;
</script>

<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import { isScaleBand } from '$lib/utils/scales.svelte.js';
  import { getPointLabelLayout } from '$lib/utils/labelPlacement.js';
  import { getPixelValue } from '../Text/Text.shared.svelte.js';
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
    labelX,
    labelY,
    seriesKey,
    fontSize = 12,
    labelGap = 2,
    link,
    details,
    props,
  }: AnnotationPointBaseProps = $props();

  const ctx = getChartContext();
  const geo = getGeoContext();

  // Over a stack the point sits on its series' running total, not on the series' own value
  const stackedX = $derived(ctx.valueAxis === 'x' ? ctx.stackedValue(seriesKey, y, x) : x);
  const stackedY = $derived(ctx.valueAxis === 'y' ? ctx.stackedValue(seriesKey, x, y) : y);

  const point = $derived.by(() => {
    if (geo.projection && typeof x === 'number' && typeof y === 'number') {
      const [px, py] = geo.projection([x, y]) ?? [0, 0];
      return { x: px, y: py };
    }
    return {
      x: stackedX
        ? ctx.xScale(stackedX) + (isScaleBand(ctx.xScale) ? ctx.xScale.bandwidth() / 2 : 0)
        : 0,
      y: stackedY
        ? ctx.yScale(stackedY) + (isScaleBand(ctx.yScale) ? ctx.yScale.bandwidth() / 2 : 0)
        : ctx.height,
    };
  });

  // Where `smart`/discrete placement puts the label — shared with `getPointLabelRect`
  // consumers (e.g. occlusion) so the measured box matches the rendered label.
  const labelLayout = $derived(
    getPointLabelLayout({
      x: point.x,
      y: point.y,
      r,
      labelPlacement,
      labelX,
      labelY,
      labelXOffset,
      labelYOffset,
      fontSize: getPixelValue(fontSize),
      labelGap,
      link: !!link,
      verticalAnchor: props?.label?.verticalAnchor,
    })
  );

  // Render `<Text>` with the raw `fontSize` (it resolves em/etc. itself)
  const labelProps = $derived({ ...labelLayout.text, fontSize });

  // Leader `<Link>` endpoints. The target is the anchor; the source sits on the
  // ring — following the label for `smart`, but fixed to the placement direction
  // otherwise. Spacing to the text is handled by `labelGap` (which moves the
  // text, not the line).
  const linkEndpoints = $derived.by(() => {
    if (!link) return null;
    const a = labelLayout.anchor;

    if (labelPlacement === 'smart') {
      const dx = a.x - point.x;
      const dy = a.y - point.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= r) return null;
      return {
        source: { x: point.x + (r * dx) / dist, y: point.y + (r * dy) / dist },
        target: { x: a.x, y: a.y },
      };
    }

    const { x: dirX, y: dirY } = labelLayout.direction;
    if (dirX === 0 && dirY === 0) return null; // labelPlacement='center' — no line
    const mag = Math.hypot(dirX, dirY);
    return {
      source: { x: point.x + (r * dirX) / mag, y: point.y + (r * dirY) / mag },
      target: { x: a.x, y: a.y },
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

{#if linkEndpoints && Link}
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
