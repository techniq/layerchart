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
    fontSize = 12,
    labelGap = 2,
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

  const labelLayout = $derived.by(() => {
    const px = point.x;
    const py = point.y;
    const explicit = labelX != null || labelY != null;
    const capHeight = getPixelValue(fontSize) * 0.71;

    // Direction from the point towards the label. `smart` derives it from the
    // geometry (snapped to the 8 cardinal/diagonal directions); otherwise it
    // comes from the discrete placement.
    let dirX = 0;
    let dirY = 0;
    if (labelPlacement === 'smart') {
      const ddx = (labelX ?? px) - px;
      const ddy = (labelY ?? py) - py;
      const ax = Math.abs(ddx);
      const ay = Math.abs(ddy);
      if (ax > 1e-6 || ay > 1e-6) {
        dirX = ax >= ay * 0.4 ? Math.sign(ddx) : 0;
        dirY = ay >= ax * 0.4 ? Math.sign(ddy) : 0;
      }
    } else if (labelPlacement !== 'center') {
      dirX = labelPlacement.includes('left') ? -1 : labelPlacement.includes('right') ? 1 : 0;
      dirY = labelPlacement.includes('top') ? -1 : labelPlacement.includes('bottom') ? 1 : 0;
    }

    const mag = Math.hypot(dirX, dirY) || 1;
    const signX = dirX < 0 ? -1 : 1;
    const signY = dirY < 0 ? -1 : 1;

    // The link connects the ring to this anchor — either an explicit
    // `labelX`/`labelY`, or offset from the point in the direction.
    const anchorX = explicit ? (labelX ?? px) : px + (r * dirX) / mag + labelXOffset * signX;
    const anchorY = explicit ? (labelY ?? py) : py + (r * dirY) / mag + labelYOffset * signY;

    // When there's a leader line, nudge the text away from the point (along the
    // line) by `labelGap` to leave spacing — the line itself is unchanged.
    const gap = link ? labelGap : 0;
    const adx = anchorX - px;
    const ady = anchorY - py;
    const adist = Math.hypot(adx, ady) || 1;
    const gapX = (gap * adx) / adist;
    const gapY = (gap * ady) / adist;

    // Bias by half the cap height so the near edge (not the center) sits at the
    // (gap-adjusted) anchor — keeps top/bottom symmetric for any fontSize. Skip
    // it when the caller sets an explicit `verticalAnchor` (they control it).
    const capBias =
      props?.label?.verticalAnchor != null
        ? 0
        : dirY > 0
          ? capHeight / 2
          : dirY < 0
            ? -capHeight / 2
            : 0;

    return {
      dirX,
      dirY,
      anchor: { x: anchorX, y: anchorY },
      text: {
        x: anchorX + gapX,
        y: anchorY + gapY + capBias,
        textAnchor: (dirX > 0 ? 'start' : dirX < 0 ? 'end' : 'middle') as
          | 'start'
          | 'end'
          | 'middle',
        verticalAnchor: 'middle' as const,
        fontSize,
      },
    };
  });

  const labelProps = $derived(labelLayout.text);

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

    const { dirX, dirY } = labelLayout;
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
