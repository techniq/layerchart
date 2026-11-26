<script lang="ts" module>
  import type { Accessor } from 'layerchart';
  import type { AreaProps } from './Area.shared.svelte.js';
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { group } from 'd3-array';
  import { BufferGeometry, Float32BufferAttribute } from 'three';
  import { accessor, colorPropGroupKey, getChartContext, resolveDataProp } from 'layerchart';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { curvePoints } from '../../utils/curve.js';
  import { createMerged } from '../../utils/merged.svelte.js';
  import { createPathMotion } from '../../utils/rowMotion.svelte.js';
  import { defined, position, resolveAccessor, rowColor, scaled } from '../../utils/marks.js';

  let {
    data: dataProp,
    x,
    y,
    y0,
    y1,
    z,
    z0 = 0,
    g,
    curve,
    defined: definedProp,
    fill,
    class: className,
    opacity = 1,
    fillOpacity = 1,
    line = false,
    strokeWidth: strokeWidthProp,
    tooltip = false,
    motion,
  }: AreaProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets */
  const look = $derived(scene.style(className));
  /** The line's own props, when `line` gives them (as the core `Area` takes a `Spline`'s) */
  const lineProps = $derived(typeof line === 'object' ? line : null);
  /** What the line's `class` sets */
  const lineLook = $derived(scene.style(lineProps?.class));
  const strokeWidth = $derived(
    lineProps?.strokeWidth ?? lineLook?.strokeWidth ?? strokeWidthProp ?? look?.strokeWidth ?? 1
  );

  ctx.registerComponent({
    name: 'Area',
    kind: 'mark',
    markInfo: () => ({ data: dataProp, x, y, color: typeof fill === 'string' ? fill : undefined }),
  });

  const rows = $derived((dataProp ?? ctx.data ?? []) as any[]);
  const xAccessor = $derived(resolveAccessor(x, ctx.config.x));
  const yAccessor = $derived(resolveAccessor(y, ctx.config.y));
  const y0Accessor = $derived(y0 == null ? null : accessor(y0));
  const y1Accessor = $derived(y1 == null ? null : accessor(y1));

  /**
   * The chart's area bottoms and tops (as the core `Area`'s): a stack's (areas stack by nature,
   * as the chart's `seriesLayout` says), else its values over the baseline
   */
  const chartEdges = $derived(ctx.areaAccessorsFor({ ownData: dataProp != null }));

  /** Standing up as a curtain, rather than lying on the floor as the core `Area` fills the plot */
  const curtain = $derived(y0 == null && y1 == null && (z != null || ctx.config.z != null));

  /** As `Spline`: what splits the rows into areas */
  const gAccessor = $derived.by<((d: any) => unknown) | null>(() => {
    const gProp = g ?? (ctx.props as { g?: Accessor }).g;
    if (gProp != null) return accessor(gProp);
    const first = rows[0];
    const implied = colorPropGroupKey(fill, first);
    if (implied != null) return accessor(implied);
    if (dataProp != null) return null;
    return first != null && ctx.cKey(first) != null ? ctx.cKey : null;
  });

  /**
   * Each row's column: where it stands on the floor (`x`, `y`), and its two edges, `a` and `b` —
   * heights for a curtain, else positions down the plot
   */
  type Column = { d: any; x: number; y: number; a: number; b: number };

  function columnOf(d: any): Column | null {
    const xValue = xAccessor(d);
    const yValue = yAccessor(d);
    if (curtain) {
      if (!defined(xValue) || !defined(yValue)) return null;
      const [px, py] = position(ctx, xValue, yValue);
      const top = ctx.heightOf(d, z)[1];
      const base = resolveDataProp(z0, d, ctx.zScale, 0) as number;
      return [px, py, top, base].every(Number.isFinite)
        ? { d, x: px, y: py, a: base, b: top }
        : null;
    }
    // Lying on the floor between `y0` and `y1`, as the core `Area` (a stacked row's value is
    // its `[base, top]`)
    const stacked = Array.isArray(yValue) ? yValue : null;
    // Its own `y` as given, else the chart's (stacked as the core `Area` stacks)
    const own = y != null;
    const top = y1Accessor
      ? y1Accessor(d)
      : !own
        ? chartEdges.y1(d)
        : stacked
          ? stacked[1]
          : yValue;
    const base = y0Accessor ? y0Accessor(d) : !own ? chartEdges.y0(d) : stacked ? stacked[0] : null;
    if (!defined(xValue) || !defined(top)) return null;
    const px = scaled(ctx.xScale, xValue);
    const pTop = scaled(ctx.yScale, top);
    const pBase = base == null ? Math.max(...(ctx.yRange as number[])) : scaled(ctx.yScale, base);
    return [px, pTop, pBase].every(Number.isFinite)
      ? { d, x: px, y: pTop, a: pBase, b: pTop }
      : null;
  }

  /** A run of columns taken along `curve`: each edge curved through its own */
  function curved(columns: Column[]): Column[] {
    if (!curve || columns.length < 2) return columns;
    const along = (edge: (c: Column) => number) =>
      curvePoints(
        columns.map((c) => [c.x, edge(c)]),
        curve
      );
    const near = (at: number) => columns[Math.min(Math.round(at), columns.length - 1)];
    if (curtain) {
      // The curtain's floor path stays as it is; its top and base curve against `x`
      const tops = along((c) => c.b);
      const bases = along((c) => c.a);
      return tops.map((top, i) => {
        const k = Math.min(Math.floor(top.at), columns.length - 2);
        const t = top.at - k;
        const [p, q] = [columns[k], columns[k + 1]];
        return {
          d: near(top.at).d,
          x: top.x,
          y: p.y + (q.y - p.y) * t,
          a: bases[Math.min(i, bases.length - 1)].y,
          b: top.y,
        };
      });
    }
    const tops = along((c) => c.b);
    const bases = along((c) => c.a);
    return tops.map((top, i) => ({
      d: near(top.at).d,
      x: top.x,
      y: top.y,
      a: bases[Math.min(i, bases.length - 1)].y,
      b: top.y,
    }));
  }

  /** How far a floor area's line stands above its fill, well under the next mark's layer */
  const LINE_LIFT = 0.3;

  /** The line's color: its own `stroke` (or its class's), else the area's */
  function lineColor(d: any, areaColor: string) {
    // A class's own stroke wins, as CSS does in core's layers
    if (lineLook?.strokeSet && lineLook.stroke) return lineLook.stroke;
    if (lineProps?.stroke != null) return rowColor(ctx, lineProps.stroke, d, areaColor);
    return lineLook?.stroke ?? areaColor;
  }

  /** Each area's runs of columns as asked (broken where a row isn't drawn), with its colors */
  const runs = $derived(
    (gAccessor ? [...group(rows, gAccessor).values()] : [rows]).flatMap((areaRows, area) => {
      const pieces: Column[][] = [[]];
      areaRows.forEach((d, i) => {
        const column = definedProp?.(d, i, areaRows) === false ? null : columnOf(d);
        if (column) pieces[pieces.length - 1].push(column);
        else if (pieces[pieces.length - 1].length) pieces.push([]);
      });
      const color = rowColor(
        ctx,
        fill,
        areaRows[0],
        'var(--color-primary, currentColor)',
        look?.fill,
        look?.fillSet
      );
      const stroke = line ? lineColor(areaRows[0], color) : null;
      return pieces
        .filter((piece) => piece.length >= 2)
        .map((piece, k) => ({ key: `${area}:${k}`, color, stroke, columns: curved(piece) }));
    })
  );

  // Tweening to where they're asked to be, as core's areas (a spring leaves them, as core's), a
  // new one up from the baseline: each column as `[x, y, a, b]`
  const pathMotion = createPathMotion(
    untrack(() => motion),
    4
  );
  const flat = (columns: Column[]) => columns.flatMap((c) => [c.x, c.y, c.a, c.b]);
  if (pathMotion) {
    $effect(() => {
      const active = new Set<unknown>();
      for (const run of runs) {
        active.add(run.key);
        untrack(() => pathMotion.update(run.key, flat(run.columns), flat(collapsed(run.columns))));
      }
      untrack(() => pathMotion.cleanup(active));
    });
  }

  /** Columns with no height: a floor area's edges on the baseline, a curtain's top at its base */
  function collapsed(columns: Column[]): Column[] {
    if (curtain) return columns.map((c) => ({ ...c, b: c.a }));
    const zero = Number(ctx.yScale(0));
    const baseline = Math.min(Number.isFinite(zero) ? zero : ctx.yRange[0], ctx.yRange[0]);
    return columns.map((c) => ({ ...c, y: baseline, a: baseline, b: baseline }));
  }

  /** Each run's columns where they are now */
  function columnsNow(run: { key: string; columns: Column[] }): Column[] {
    if (!pathMotion) return run.columns;
    const now = pathMotion.get(run.key);
    if (!now) return collapsed(run.columns);
    return run.columns.map((c, i) => ({
      ...c,
      x: now[i * 4],
      y: now[i * 4 + 1],
      a: now[i * 4 + 2],
      b: now[i * 4 + 3],
    }));
  }

  createMerged({
    tooltip: () => tooltip,
    items: () =>
      runs.map((run) => {
        const columns = columnsNow(run);
        const positions: number[] = [];
        // In the scene's axes (chart x, height, chart y): each column's two edges
        const edges = (c: Column): [number[], number[]] =>
          curtain
            ? [
                [c.x, c.a, c.y],
                [c.x, c.b, c.y],
              ]
            : [
                [c.x, 0.1, c.a],
                [c.x, 0.1, c.b],
              ];
        for (let k = 0; k < columns.length - 1; k++) {
          const [a0, a1] = edges(columns[k]);
          const [b0, b1] = edges(columns[k + 1]);
          positions.push(...a0, ...b0, ...a1, ...a1, ...b0, ...b1);
        }
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
        geometry.computeVertexNormals();
        return {
          d: columns[0].d,
          geometry: positions.length ? geometry : null,
          fill: run.color,
          // On the floor, a little above the fill, so all its width draws over it (a depth
          // offset alone isn't enough on every GPU for lines in the fill's own plane)
          lines: line
            ? [
                columns.flatMap((c) => {
                  const [x, up, y] = edges(c)[1];
                  return [x, curtain ? up : up + LINE_LIFT, y];
                }),
              ]
            : [],
          stroke: run.stroke,
        };
      }),
    opacity: () => opacity * fillOpacity * (look?.opacity ?? 1),
    strokeWidth: () => strokeWidth,
  });
</script>
