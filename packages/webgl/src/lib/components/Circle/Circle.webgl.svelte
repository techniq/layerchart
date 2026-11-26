<script lang="ts" module>
  import type { CircleProps } from './Circle.shared.svelte.js';
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { CircleGeometry, Color, SphereGeometry } from 'three';
  import { getChartContext, isDataProp, resolveDataProp } from 'layerchart';
  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { createInstances, ringGeometry, scaledDash } from '../../utils/instances.svelte.js';
  import { dashPattern } from '../../utils/merged.svelte.js';
  import { markRows, positionOf, rowColor } from '../../utils/marks.js';
  import { createRowMotion } from '../../utils/rowMotion.svelte.js';

  let {
    data,
    cx = 0,
    initialCx,
    cy = 0,
    initialCy,
    r = 1,
    initialR,
    z,
    fill,
    stroke,
    strokeWidth: strokeWidthProp,
    class: className,
    style,
    opacity = 1,
    fillOpacity = 1,
    strokeOpacity = 1,
    dashArray,
    tooltip = false,
    motion,
    key = (_d: any, i: number) => i,
  }: CircleProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets */
  const look = $derived(scene.style(className, style ? { style } : undefined));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);
  /** No disc for a `none` fill (ex. `class="fill-none"`), only its ring */
  const filled = $derived(
    fill !== null && fill !== 'none' && !(fill == null && look?.fill === 'none')
  );
  /** A ring only when asked (not `none`), and flat (as `Points` draws theirs) */
  const ringed = $derived(
    !ctx.view && stroke !== 'none' && (stroke != null || !!look?.stroke) && strokeWidth > 0
  );

  const highlight = new Color(0xffffff);

  /** With rows (`data`, or props reading the chart's), as the core `Circle` */
  const dataMode = $derived(data != null || [cx, cy, r].some((p) => isDataProp(p)));

  /** Raised by its `z`, or in data mode as the core `Circle`, by the chart's */
  const raised = $derived(z != null || (dataMode && ctx.config.z != null));

  /** Each row's circle as asked: its center, radius, and height */
  const targets = $derived(
    // Through the scales as the core `Circle` (a band's start, ex. `Cell` centers it in a `Group`)
    (dataMode ? markRows(ctx, data, cx, cy, r) : [undefined]).flatMap((d, i) => {
      const [x, y] = positionOf(ctx, cx, cy, d, { bandStart: true });
      const radius = resolveDataProp(r, d, ctx.rScale, 1);
      if (![x, y, radius].every(Number.isFinite) || radius <= 0) return [];
      return [{ d, key: key(d, i), x, y, z: raised ? ctx.heightOf(d, z)[1] : 0, radius }];
    })
  );

  // Easing to where they're asked to be, as the core `Circle` (ex. a highlight springing from
  // row to row), each by its `key`, and each of `cx`, `cy`, and `r` by its own config
  const motionMap = createRowMotion(
    untrack(() => motion),
    ['cx', 'cy', 'r'] as const
  );

  /**
   * Where a new circle eases in from: its `initialCx`, `initialCy`, and `initialR`, as the core
   * `Circle` (in pixel mode only), else where it's asked to be
   */
  function initialOf(): { cx?: number; cy?: number; r?: number } | undefined {
    if (dataMode) return undefined;
    return { cx: initialCx, cy: initialCy, r: initialR };
  }

  if (motionMap) {
    $effect(() => {
      const active = new Set<unknown>();
      const initial = initialOf();
      for (const t of targets) {
        active.add(t.key);
        const values = { cx: t.x, cy: t.y, r: t.radius };
        untrack(() => motionMap.update(t.key, values, initial));
      }
      untrack(() => motionMap.cleanup(active));
    });
  }

  /** Each row's circle where it is now (a new one where it eases in from, until it starts) */
  const circles = $derived(
    motionMap
      ? targets.map((t) => {
          const now = motionMap.get(t.key);
          const from = now ?? initialOf();
          return {
            ...t,
            x: from?.cx ?? t.x,
            y: from?.cy ?? t.y,
            radius: from?.r ?? t.radius,
          };
        })
      : targets
  );

  // Flat (no `view`, seen from directly above) a disc facing up; in a 3D view, a sphere
  const disc = new CircleGeometry(1, 32).rotateX(-Math.PI / 2);
  const ball = new SphereGeometry(1, 24, 16);
  createInstances({
    tooltip: () => tooltip,
    geometry: () => (ctx.view ? ball : disc),
    instances: () =>
      (filled ? circles : []).map((c) => {
        // Inside its ring, so the two don't overlap (and darken where they're translucent)
        const radius = ringed ? Math.max(0, c.radius - strokeWidth / 2) : c.radius;
        return {
          d: c.d,
          x: c.x,
          y: c.y,
          z: c.z,
          width: radius,
          depth: radius,
          height: radius,
          color: rowColor(
            ctx,
            fill ?? undefined,
            c.d,
            'var(--color-surface-content, currentColor)',
            look?.fill,
            look?.fillSet
          ),
        };
      }),
    opacity: () => opacity * fillOpacity * (look?.opacity ?? 1),
    emphasize: (color) => color.lerp(highlight, 0.25),
  });

  // Its ring, half its width either side of its edge, as an SVG circle's stroke
  createInstances({
    geometry: ringGeometry(),
    ring: () => (strokeWidth / 2) * scene.unit,
    dash: () => scaledDash(dashPattern(dashArray), scene.unit),
    instances: () =>
      ringed
        ? circles.map((c) => ({
            d: c.d,
            x: c.x,
            y: c.y,
            // Over its circle, flat
            z: c.z + 0.01,
            width: c.radius,
            depth: c.radius,
            height: c.radius,
            color: rowColor(ctx, stroke, c.d, 'currentColor', look?.stroke, look?.strokeSet),
          }))
        : [],
    opacity: () => opacity * strokeOpacity * (look?.opacity ?? 1),
    emphasize: (color) => color.lerp(highlight, 0.25),
  });
</script>
