<script lang="ts" module>
  import type { Accessor, ColorProp, DataProp } from 'layerchart';
  import type { CurveFactory } from 'd3-shape';

  export type SplineProps = {
    /** Override the chart's `data` */
    data?: any[];
    /** Override the chart's `x` accessor */
    x?: Accessor;
    /** Override the chart's `y` accessor */
    y?: Accessor;
    /**
     * Height off the floor: a data key or function (through the chart's `z` scale), or a number
     * of pixels.  Defaults to the chart's `z`.
     */
    z?: DataProp;
    /**
     * Draw one line per distinct value, in data order.  Defaults to the chart's `g`, else the
     * data key `stroke` names, else the chart's `c` (as LayerChart's `Spline`).
     */
    g?: Accessor;
    /**
     * A CSS color, or a data key / function run through the chart's color scale — per row, so a
     * line can change color along its length.  Defaults to the chart's `c`, else
     * `var(--color-primary)`.
     */
    stroke?: ColorProp;
    /**
     * Line width in pixels, the same at any depth.
     *
     * @default 2
     */
    strokeWidth?: number;
    /**
     * CSS classes to style it by, as LayerChart's marks take them (ex. `fill-red-500 opacity-50`):
     * the fill, stroke, stroke width, and opacity they set, where its props don't say
     */
    class?: string;
    /** @default 1 */
    opacity?: number;
    /**
     * The d3 curve each line takes through its rows (ex. `curveMonotoneX`), as LayerChart's
     * `Spline` draws it.  Straight between them without one.
     */
    curve?: CurveFactory;
    /** Whether a row is drawn: a line breaks at rows it isn't, as LayerChart's `Spline` does */
    defined?: (d: any, index: number, data: any[]) => boolean;
    /**
     * Show the tooltip for the row nearest where the pointer is over a line (with the chart's
     * `tooltipContext`).
     *
     * @default false
     */
    tooltip?: boolean;
  };
</script>

<script lang="ts">
  import { Vector3 } from 'three';
  import { Line2 } from 'three/addons/lines/Line2.js';
  import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
  import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
  import { group } from 'd3-array';
  import { accessor, colorPropDataKey, getChartContext } from 'layerchart';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { getSphere, sphereArc } from '../../utils/globe.js';
  import { curvePoints } from '../../utils/curve.js';
  import { defined, position, resolveAccessor, rowColor } from '../../utils/marks.js';

  let {
    data: dataProp,
    x,
    y,
    z,
    g,
    stroke,
    strokeWidth: strokeWidthProp,
    class: className,
    opacity = 1,
    curve,
    defined: definedProp,
    tooltip = false,
  }: SplineProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets */
  const look = $derived(scene.style(className));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 2);

  ctx.registerComponent({
    name: 'Spline',
    kind: 'mark',
    markInfo: () => ({
      data: dataProp,
      x,
      y,
      color: typeof stroke === 'string' ? stroke : undefined,
    }),
  });

  const sphere = $derived(getSphere(ctx));
  const xAccessor = $derived(resolveAccessor(x, ctx.config.x));
  const yAccessor = $derived(resolveAccessor(y, ctx.config.y));
  const rows = $derived((dataProp ?? ctx.data ?? []) as any[]);

  /**
   * What splits the rows into lines: this mark's `g`, the chart's `g`, the data key `stroke`
   * names, then the chart's `c` — what colors the lines splits them.  Rows the mark was handed
   * itself are taken as already grouped.
   */
  const gAccessor = $derived.by<((d: any) => unknown) | null>(() => {
    const gProp = g ?? (ctx.props as { g?: Accessor }).g;
    if (gProp != null) return accessor(gProp);
    const first = rows[0];
    const implied = colorPropDataKey(stroke, first);
    if (implied != null) return accessor(implied);
    if (dataProp != null) return null;
    return first != null && ctx.cKey(first) != null ? ctx.cKey : null;
  });

  const lines = $derived(
    (gAccessor ? [...group(rows, gAccessor).values()] : [rows])
      .flatMap((lineRows) => {
        type Line = { positions: number[]; colors: string[]; data: any[] };
        const segments: Line[] = [];
        let line: Line = { positions: [], colors: [], data: [] };
        /** A gap: the line so far is one segment, and the next row starts another */
        const breakLine = () => {
          if (line.data.length) segments.push(line);
          line = { positions: [], colors: [], data: [] };
          previous = null;
          previousRow = null;
        };
        /** On a globe, the last row's longitude / latitude / height, to arc from */
        let previous: [number, number, number] | null = null;
        let previousRow: any = null;
        lineRows.forEach((d, i) => {
          const xValue = xAccessor(d);
          const yValue = yAccessor(d);
          if (!defined(xValue) || !defined(yValue) || definedProp?.(d, i, lineRows) === false) {
            breakLine();
            return;
          }
          const height = ctx.config.z != null || z != null ? ctx.heightOf(d, z)[1] : 0;
          const color = rowColor(
            ctx,
            stroke,
            d,
            'var(--color-primary, currentColor)',
            look?.stroke
          );
          if (sphere) {
            // Over the globe, along the great circle from the last row
            const here: [number, number, number] = [Number(xValue), Number(yValue), height];
            const arc = previous ? sphereArc(sphere, previous, here) : sphere.toScene(...here);
            for (let k = previous ? 3 : 0; k < arc.length; k += 3) {
              line.positions.push(arc[k], arc[k + 1], arc[k + 2]);
              line.colors.push(color);
              // Points along the arc go with the row nearer them
              line.data.push(previousRow != null && k < arc.length / 2 ? previousRow : d);
            }
            previous = here;
            previousRow = d;
            return;
          }
          const [px, py] = position(ctx, xValue, yValue);
          const point = [px, height, py];
          // Out of a scale's domain, a position is `NaN`
          if (!point.every((v) => Number.isFinite(v))) {
            breakLine();
            return;
          }
          line.positions.push(...point);
          line.colors.push(color);
          line.data.push(d);
        });
        breakLine();
        return curve && !sphere ? segments.map(curved) : segments;
      })
      .filter((line) => line.positions.length >= 6)
  );

  /** A line's points taken along `curve`, each sampled point's height, color, and row from between its own */
  function curved(line: { positions: number[]; colors: string[]; data: any[] }) {
    const count = line.data.length;
    if (count < 2 || !curve) return line;
    const floor: [number, number][] = [];
    const heights: number[] = [];
    for (let i = 0; i < count; i++) {
      floor.push([line.positions[i * 3], line.positions[i * 3 + 2]]);
      heights.push(line.positions[i * 3 + 1]);
    }
    const out = { positions: [] as number[], colors: [] as string[], data: [] as any[] };
    for (const { x, y, at } of curvePoints(floor, curve)) {
      const k = Math.min(Math.floor(at), count - 1);
      const t = at - k;
      const height = k + 1 < count ? heights[k] + (heights[k + 1] - heights[k]) * t : heights[k];
      const nearest = Math.min(Math.round(at), count - 1);
      out.positions.push(x, height, y);
      out.colors.push(line.colors[nearest]);
      out.data.push(line.data[nearest]);
    }
    return out;
  }

  $effect(() => {
    const objects = lines.map(({ positions, colors, data }) => {
      const geometry = new LineGeometry();
      geometry.setPositions(positions);
      // A color per point, blended between them; a line's alpha is its first point's
      const rgb: number[] = [];
      let alpha = 1;
      colors.forEach((color, i) => {
        const resolved = scene.color(color);
        rgb.push(resolved?.color.r ?? 0.5, resolved?.color.g ?? 0.5, resolved?.color.b ?? 0.5);
        if (i === 0) alpha = resolved?.opacity ?? 1;
      });
      geometry.setColors(rgb);
      const material = new LineMaterial({
        vertexColors: true,
        linewidth: strokeWidth,
        transparent: opacity * (look?.opacity ?? 1) * alpha < 1,
        opacity: opacity * (look?.opacity ?? 1) * alpha,
      });
      const line = new Line2(geometry, material);
      scene.root.add(line);
      // Each segment's row is the one at its nearer end
      const removePickable = tooltip
        ? scene.addPickable({
            object: line,
            datum: (hit) => {
              const i = hit.faceIndex;
              if (i == null) return undefined;
              const from = new Vector3().fromArray(positions, i * 3);
              const to = new Vector3().fromArray(positions, i * 3 + 3);
              line.localToWorld(from);
              line.localToWorld(to);
              return hit.point.distanceTo(from) <= hit.point.distanceTo(to) ? data[i] : data[i + 1];
            },
          })
        : null;
      return { line, removePickable };
    });
    scene.invalidate();

    return () => {
      for (const { line, removePickable } of objects) {
        removePickable?.();
        scene.root.remove(line);
        line.geometry.dispose();
        line.material.dispose();
      }
      scene.invalidate();
    };
  });
</script>
