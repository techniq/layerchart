<script lang="ts" module>
  import type { LinkProps } from './Link.shared.svelte.js';
</script>

<script lang="ts">
  import { curveBumpX, curveBumpY } from 'd3-shape';
  import { getChartContext, isDataProp } from 'layerchart';
  import { getLinkD3Path, getLinkPresetPath } from 'layerchart/utils/linkUtils';
  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { flattenPath } from '../../utils/path.js';

  import { getSphere, type ScenePoint } from '../../utils/globe.js';
  import { markRows, placeOf, rowColor } from '../../utils/marks.js';
  import { untrack } from 'svelte';
  import { createMerged } from '../../utils/merged.svelte.js';
  import { createPathMotion } from '../../utils/rowMotion.svelte.js';
  import { valueOf } from '../../utils/values.js';

  let {
    data,
    x1,
    y1,
    x2,
    y2,
    z1,
    z2,
    source = (d) => d.source,
    target = (d) => d.target,
    x: xProp,
    y: yProp,
    type = 'd3',
    curve: curveProp,
    orientation = 'vertical',
    sweep: sweepProp,
    radius = 20,
    bend = 22.5,
    arc = 0,
    stroke,
    strokeWidth: strokeWidthProp,
    class: className,
    opacity = 1,
    motion,
  }: LinkProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets */
  const look = $derived(scene.style(className));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);
  /** Its rows: `data` as given, or one link (as the core `Link` takes it) */
  const rows = $derived(Array.isArray(data) ? data : data != null ? [data] : undefined);
  const sphere = $derived(getSphere(ctx));

  // As the core `Link`: a node's `x` across and `y` down (swapped across a horizontal tree),
  // along a bump curve in the tree's direction, or a preset path's shape
  const x = $derived(xProp ?? ((node: any) => (orientation === 'horizontal' ? node.y : node.x)));
  const y = $derived(yProp ?? ((node: any) => (orientation === 'horizontal' ? node.x : node.y)));
  const curve = $derived(curveProp ?? (orientation === 'horizontal' ? curveBumpX : curveBumpY));
  const sweep = $derived(
    type === 'd3'
      ? (sweepProp ?? 'none')
      : sweepProp && sweepProp !== 'none'
        ? sweepProp
        : orientation === 'vertical'
          ? 'horizontal-vertical'
          : 'vertical-horizontal'
  );

  /** The floor's path between a link's ends, as the core `Link` draws it, as points */
  function pathBetween(from: [number, number], to: [number, number]): [number, number][] {
    // Straight up (or nowhere) when both ends are over one point: no path across the floor
    if (from[0] === to[0] && from[1] === to[1]) return [from, to];
    const source = { x: from[0], y: from[1] };
    const target = { x: to[0], y: to[1] };
    const d =
      type === 'd3'
        ? getLinkD3Path({ source, target, sweep, curve, orientation })
        : getLinkPresetPath({ source, target, sweep, type, radius, bend });
    const points = d ? flattenPath(d) : [];
    return points.length >= 2 ? points : [from, to];
  }

  /** Ends placed by `x1` / `y1` (as the core `Link`), rather than by `source` / `target` nodes */
  const placed = $derived([x1, y1, x2, y2].some((p) => p != null));

  /** A link's ends, in the scene's axes */
  function ends(d: any): [ScenePoint, ScenePoint] {
    if (placed) {
      return [
        placeOf(ctx, sphere, x1, y1, z1 ?? 0, d),
        placeOf(ctx, sphere, x2 ?? x1, y2 ?? y1, z2 ?? 0, d),
      ];
    }
    const [from, to] = [source(d), target(d)];
    return [
      [x(from), z1 == null ? 0 : ctx.heightOf(d, z1)[1], y(from)],
      [x(to), z2 == null ? 0 : ctx.heightOf(d, z2)[1], y(to)],
    ];
  }

  /** Each link as asked: its row, points, and color */
  const links = $derived(
    (placed && !rows && ![x1, y1, x2, y2].some(isDataProp)
      ? [undefined]
      : placed
        ? markRows(ctx, rows, x1, y1, x2, y2)
        : (rows ?? [])
    ).map((d) => {
      const [[sx, sz, sy], [tx, tz, ty]] = ends(d);
      const lift = valueOf(arc, d);
      // Across the floor as the core `Link` (straight around a globe, and under an `arc`)
      const steps = lift ? 24 : 1;
      const floor: [number, number][] =
        sphere || lift
          ? Array.from({ length: steps + 1 }, (_, i): [number, number] => [
              sx + ((tx - sx) * i) / steps,
              sy + ((ty - sy) * i) / steps,
            ])
          : pathBetween([sx, sy], [tx, ty]);
      const line: number[] = [];
      floor.forEach(([px, py], i) => {
        const t = i / (floor.length - 1);
        // Its height eased from end to end, and a parabola `lift` above its middle
        const up = 4 * lift * t * (1 - t);
        line.push(px, sz + (tz - sz) * t + up, py);
      });
      return {
        d,
        line,
        stroke: rowColor(
          ctx,
          stroke,
          d,
          'var(--color-surface-content, currentColor)',
          look?.stroke,
          look?.strokeSet
        ),
      };
    })
  );

  // Tweening to where they're asked to be, as core's links (ex. a tree's as it opens), each by
  // its place in the rows
  const pathMotion = createPathMotion(untrack(() => motion));
  if (pathMotion) {
    $effect(() => {
      const active = new Set<unknown>();
      links.forEach((link, i) => {
        active.add(i);
        untrack(() => pathMotion.update(i, link.line));
      });
      untrack(() => pathMotion.cleanup(active));
    });
  }

  createMerged({
    items: () =>
      links.map((link, i) => ({
        d: link.d,
        geometry: null,
        fill: null,
        lines: [pathMotion?.get(i) ?? link.line],
        stroke: link.stroke,
      })),
    opacity: () => 1,
    lineOpacity: () => opacity * (look?.opacity ?? 1),
    strokeWidth: () => strokeWidth,
  });
</script>
