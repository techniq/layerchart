<script lang="ts" module>
  import type { DataProp } from 'layerchart';
  import type { ValueProp } from '../../utils/values.js';

  export type LinkProps = {
    /** Rows to draw a link each for.  Falls back to the chart's data when `x1` / `y1` read rows. */
    data?: any[];
    /**
     * Where each link starts across the plot: a data property name or function of the row
     * through the chart's `x` scale (longitude on a map), or pixels
     */
    x1?: DataProp;
    /** Where each link starts down the plot, as `x1` through the `y` scale (latitude on a map) */
    y1?: DataProp;
    /** Where each link ends across the plot, as `x1`.  Defaults to `x1`. */
    x2?: DataProp;
    /** Where each link ends down the plot, as `y1`.  Defaults to `y1`. */
    y2?: DataProp;
    /**
     * The height of each link's start: a data property name or function of the row through the
     * chart's `z` scale, or pixels.
     *
     * @default 0
     */
    z1?: DataProp;
    /** The height of each link's end, as `z1`.  @default 0 */
    z2?: DataProp;
    /**
     * Without `x1` / `y1`: the node each link starts at (ex. a hierarchy's links), placed by `x`
     * and `y` in pixels.
     *
     * @default (d) => d.source
     */
    source?: (d: any) => any;
    /** The node each link ends at, as `source`.  @default (d) => d.target */
    target?: (d: any) => any;
    /** A node's pixels across the plot, for `source` / `target`.  @default (node) => node.x */
    x?: (node: any) => number;
    /** A node's pixels down the plot, for `source` / `target`.  @default (node) => node.y */
    y?: (node: any) => number;
    /**
     * How high each link arches above the straight line between its ends, in pixels (ex. flight
     * paths over a map), or a function of the row.
     *
     * @default 0 (straight)
     */
    arc?: ValueProp<number>;
    /**
     * A CSS color, or a function of the row.
     *
     * @default 'var(--color-surface-content)'
     */
    stroke?: ValueProp<string>;
    /** @default 1 */
    strokeWidth?: number;
  };
</script>

<script lang="ts">
  import { getChartContext, isDataProp } from 'layerchart';

  import { getSphere, type ScenePoint } from '../../utils/globe.js';
  import { markRows, placeOf } from '../../utils/marks.js';
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

  /** Ends placed by `x1` / `y1` (as LayerChart's `Link`), rather than by `source` / `target` nodes */
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
        return { d, geometry: null, fill: null, lines: [line], stroke: valueOf(stroke, d) };
      }),
    opacity: () => 1,
    strokeWidth: () => strokeWidth,
  });
</script>
