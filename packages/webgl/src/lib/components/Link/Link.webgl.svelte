<script lang="ts" module>
  import type { LinkProps } from './Link.shared.svelte.js';
</script>

<script lang="ts">
  import { getChartContext, isDataProp } from 'layerchart';

  import { getSphere, type ScenePoint } from '../../utils/globe.js';
  import { markRows, placeOf, rowColor } from '../../utils/marks.js';
  import { createMerged } from '../../utils/merged.svelte.js';
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
    x = (node) => node.x,
    y = (node) => node.y,
    arc = 0,
    stroke = 'var(--color-surface-content, currentColor)',
    strokeWidth = 1,
  }: LinkProps = $props();

  const ctx = getChartContext();
  const sphere = $derived(getSphere(ctx));

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

  createMerged({
    items: () =>
      (placed && !data && ![x1, y1, x2, y2].some(isDataProp)
        ? [undefined]
        : placed
          ? markRows(ctx, data, x1, y1, x2, y2)
          : (data ?? [])
      ).map((d) => {
        const [[sx, sz, sy], [tx, tz, ty]] = ends(d);
        const lift = valueOf(arc, d);
        const steps = lift ? 24 : 1;
        const line: number[] = [];
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          // A parabola over the straight line, peaking `lift` above its middle
          const up = 4 * lift * t * (1 - t);
          line.push(sx + (tx - sx) * t, sz + (tz - sz) * t + up, sy + (ty - sy) * t);
        }
        return {
          d,
          geometry: null,
          fill: null,
          lines: [line],
          stroke: rowColor(ctx, stroke, d, 'var(--color-surface-content, currentColor)'),
        };
      }),
    opacity: () => 1,
    strokeWidth: () => strokeWidth,
  });
</script>
