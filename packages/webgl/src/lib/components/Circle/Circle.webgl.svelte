<script lang="ts" module>
  import type { CircleProps } from './Circle.shared.svelte.js';
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { CircleGeometry, Color, SphereGeometry } from 'three';
  import { createDataMotionMap } from 'layerchart/utils/motion.svelte';
  import { getChartContext, isDataProp, resolveDataProp } from 'layerchart';
  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { createInstances, ringGeometry } from '../../utils/instances.svelte.js';
  import { markRows, positionOf, rowColor } from '../../utils/marks.js';

  let {
    data,
    cx = 0,
    cy = 0,
    r = 1,
    z,
    fill,
    stroke,
    strokeWidth: strokeWidthProp,
    class: className,
    opacity = 1,
    tooltip = false,
    motion,
    key = (_d: any, i: number) => i,
  }: CircleProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets */
  const look = $derived(scene.style(className));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);
  /** No disc for a `none` fill (ex. `class="fill-none"`), only its ring */
  const filled = $derived(
    fill !== null && fill !== 'none' && !(fill == null && look?.fill === 'none')
  );
  /** A ring only when asked, and flat (as `Points` draws theirs) */
  const ringed = $derived(!ctx.view && (stroke != null || !!look?.stroke) && strokeWidth > 0);

  const highlight = new Color(0xffffff);

  /** With rows (`data`, or props reading the chart's), as the core `Circle` */
  const dataMode = $derived(data != null || [cx, cy, r].some((p) => isDataProp(p)));

  /** Each row's circle as asked: its center, radius, and height */
  const targets = $derived(
    (dataMode ? markRows(ctx, data, cx, cy, r) : [undefined]).flatMap((d, i) => {
      const [x, y] = positionOf(ctx, cx, cy, d);
      const radius = resolveDataProp(r, d, ctx.rScale, 1);
      if (![x, y, radius].every(Number.isFinite) || radius <= 0) return [];
      return [{ d, key: key(d, i), x, y, z: z == null ? 0 : ctx.heightOf(d, z)[1], radius }];
    })
  );

  // Easing to where they're asked to be, as the core `Circle` (ex. a highlight springing from
  // row to row), each by its `key`
  const motionMap = createDataMotionMap(untrack(() => motion));
  if (motionMap) {
    $effect(() => {
      const active = new Set<unknown>();
      for (const t of targets) {
        active.add(t.key);
        untrack(() => motionMap.update(t.key, { x: t.x, y: t.y, r: t.radius }));
      }
      untrack(() => motionMap.cleanup(active));
    });
  }

  /** Each row's circle where it is now */
  const circles = $derived(
    targets.map((t) => {
      const now = motionMap?.get(t.key);
      return now ? { ...t, x: now.x, y: now.y, radius: now.r } : t;
    })
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
            look?.fill
          ),
        };
      }),
    opacity: () => opacity * (look?.opacity ?? 1),
    emphasize: (color) => color.lerp(highlight, 0.25),
  });

  // Its ring, half its width either side of its edge, as an SVG circle's stroke
  createInstances({
    geometry: ringGeometry(),
    ring: () => (strokeWidth / 2) * scene.unit,
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
            color: rowColor(ctx, stroke, c.d, 'currentColor', look?.stroke),
          }))
        : [],
    opacity: () => opacity * (look?.opacity ?? 1),
    emphasize: (color) => color.lerp(highlight, 0.25),
  });
</script>
