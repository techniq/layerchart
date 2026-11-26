<script lang="ts" module>
  import type { PolygonProps } from './Polygon.shared.svelte.js';
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { getChartContext, hasAnyDataProp, resolveDataProp } from 'layerchart';
  import { polygon } from 'layerchart/utils/shape';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { createMerged } from '../../utils/merged.svelte.js';
  import { markRows, positionOf, rowColor } from '../../utils/marks.js';
  import { createRowMotion } from '../../utils/rowMotion.svelte.js';
  import { extrude, ShapeContext } from '../../utils/shapes.js';

  let {
    cx,
    initialCx,
    cy,
    initialCy,
    r,
    initialR,
    data,
    key = (_, i) => i,
    points = 4,
    cornerRadius = 0,
    rotate = 0,
    inset = 0,
    scaleX = 1,
    scaleY = 1,
    skewX = 0,
    skewY = 0,
    tiltX = 0,
    tiltY = 0,
    motion,
    z,
    fill,
    stroke,
    fillOpacity = 1,
    strokeOpacity = 1,
    strokeWidth: strokeWidthProp,
    opacity = 1,
    class: className,
    tooltip = false,
  }: PolygonProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets, where its props don't say */
  const look = $derived(scene.style(className));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);

  /** Whether the props read rows, as the core `Polygon` decides */
  const dataMode = $derived(hasAnyDataProp(cx, cy, r));

  /** Each row's center and radius, in pixels, by its `key` */
  const targets = $derived(
    (dataMode ? markRows(ctx, data, cx, cy, r) : [undefined]).map((d, i) => {
      const [x, y] = positionOf(ctx, cx, cy, d);
      return {
        d,
        key: dataMode ? key(d, i) : 0,
        cx: x,
        cy: y,
        r: resolveDataProp(r, d, ctx.rScale, typeof r === 'number' ? r : 1),
      };
    })
  );

  /** Where a polygon placed by pixels starts, as the core `Polygon`'s `initialCx` ... */
  const initial = $derived(
    dataMode
      ? undefined
      : Object.fromEntries(
          Object.entries({ cx: initialCx, cy: initialCy, r: initialR }).filter(
            ([, value]) => value != null
          )
        )
  );

  // Easing each center and radius to where they're asked to be, as the core `Polygon`: a row at
  // a time by its `key`, and a polygon placed by pixels from its `initial` ones
  const PROPS = ['cx', 'cy', 'r'] as const;
  const motionMap = createRowMotion(
    untrack(() => motion),
    PROPS
  );
  if (motionMap) {
    $effect(() => {
      const active = new Set<unknown>();
      for (const t of targets) {
        active.add(t.key);
        untrack(() => motionMap.update(t.key, t, initial));
      }
      untrack(() => motionMap.cleanup(active));
    });
  }

  /** Each polygon's center and radius where they are now */
  const shapes = $derived(
    motionMap ? targets.map((t) => ({ ...t, ...(motionMap.get(t.key) ?? initial) })) : targets
  );

  /** A row's corners, in pixels */
  function corners({ cx: x, cy: y, r: radius }: { cx: number; cy: number; r: number }) {
    if (typeof points !== 'number') return points;
    return polygon({
      cx: x,
      cy: y,
      count: points,
      radius,
      rotate,
      inset,
      scaleX,
      scaleY,
      skewX,
      skewY,
      tiltX,
      tiltY,
    });
  }

  /** `corners` traced into `context`, each corner rounded by `cornerRadius` (as core's are) */
  function trace(context: ShapeContext, coords: { x: number; y: number }[]) {
    if (!coords.length) return;
    if (!cornerRadius) {
      coords.forEach(({ x, y }, i) => (i ? context.lineTo(x, y) : context.moveTo(x, y)));
      context.closePath();
      return;
    }
    const n = coords.length;
    for (let i = 0; i <= n; i++) {
      const a = coords[i % n];
      const b = coords[(i + 1) % n];
      const t = Math.min(cornerRadius / Math.hypot(b.x - a.x, b.y - a.y), 0.5);
      const near = [a.x * (1 - t) + b.x * t, a.y * (1 - t) + b.y * t] as const;
      if (i === 0) context.moveTo(...near);
      else context.quadraticCurveTo(a.x, a.y, ...near);
      if (i < n) context.lineTo(a.x * t + b.x * (1 - t), a.y * t + b.y * (1 - t));
    }
    context.closePath();
  }

  /** A polygon's base and top heights, in pixels: flat (`[0, 0]`) without any */
  function heights(d: any): [number, number] {
    let pair: [number, number];
    if (Array.isArray(z)) pair = z;
    else if (z != null) {
      pair = dataMode ? ctx.heightOf(d, z) : typeof z === 'number' ? [0, z] : [0, 0];
    } else pair = dataMode && ctx.config.z != null ? ctx.heightOf(d) : [0, 0];
    return [Math.min(...pair), Math.max(...pair)];
  }

  createMerged({
    tooltip: () => tooltip,
    items: () =>
      shapes.map((shape) => {
        const d = shape.d;
        const context = new ShapeContext();
        trace(context, corners(shape));
        const [base, top] = heights(d);
        // Lying flat, just above the floor (and its grid)
        const [z0, z1] = top - base > 0.01 ? [base, top] : [base + 0.3, base + 0.3];
        const outline = z1 + 0.5;
        return {
          d,
          geometry: (fill ?? look?.fill) === 'none' ? null : extrude(context, z0, z1),
          fill: rowColor(
            ctx,
            fill,
            d,
            'var(--color-surface-content, currentColor)',
            look?.fill,
            look?.fillSet
          ),
          lines: context.lines.map((line) => line.flatMap(([x, y]) => [x, outline, y])),
          stroke:
            stroke == null && !look?.stroke
              ? null
              : rowColor(ctx, stroke, d, 'currentColor', look?.stroke, look?.strokeSet),
        };
      }),
    opacity: () => opacity * fillOpacity * (look?.opacity ?? 1),
    lineOpacity: () => opacity * strokeOpacity * (look?.opacity ?? 1),
    strokeWidth: () => strokeWidth,
  });
</script>
