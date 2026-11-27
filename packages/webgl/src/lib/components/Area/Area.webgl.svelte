<script lang="ts" module>
  import type { Accessor } from 'layerchart';
  import type { AreaProps } from './Area.shared.svelte.js';
</script>

<script lang="ts">
  import { getMarkData } from 'layerchart/base';
  import { untrack } from 'svelte';
  import { group } from 'd3-array';
  import { BufferGeometry, Float32BufferAttribute } from 'three';
  import { accessor, colorPropGroupKey, getChartContext, resolveDataProp } from 'layerchart';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { curvePoints } from '../../utils/curve.js';
  import { createMerged } from '../../utils/merged.svelte.js';
  import { createPathMotion } from '../../utils/rowMotion.svelte.js';
  import { defined, position, resolveAccessor, rowColor, scaled } from '../../utils/marks.js';
  import { atRadius, pointRadial } from '../../utils/radial.js';
  import { curveVertices } from '../Line/markers.js';
  import PathWebGL from '../Path/Path.webgl.svelte';
  import { lengthOf } from '../Path/draw.svelte.js';
  import AreaOutline, { type AreaOutline as Outline } from './Area.outline.svelte';

  let {
    data: dataProp,
    x,
    y,
    y0,
    y1,
    z,
    z0 = 0,
    g,
    seriesKey,
    pathData,
    curve,
    defined: definedProp,
    fill,
    stroke,
    class: className,
    opacity = 1,
    fillOpacity = 1,
    line = false,
    strokeWidth: strokeWidthProp,
    tooltip = false,
    motion,
    draw,
    marker,
    markerMid,
    markerStart,
    markerEnd,
    startContent,
    endContent,
    strokeOpacity = 1,
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
    kind: 'composite-mark',
    // As the core `Area`'s: its top's values, and whether it stacks (with no edge given)
    markInfo: () => ({
      data: dataProp,
      x,
      y: y1 ?? y0 ?? y,
      seriesKey,
      color: typeof fill === 'string' ? fill : undefined,
      stacks: y1 == null && y0 == null && y == null,
    }),
  });

  /**
   * The series it draws, as the core `Area`: its rows, edges, and color.  Looked up only with a
   * `seriesKey`, so areas without one don't read the series state.
   */
  const series = $derived(
    seriesKey == null ? undefined : ctx.series.series.find((s) => s.key === seriesKey)
  );
  /** Faded while another series is highlighted, as the core `Area` */
  const seriesOpacity = $derived(
    series == null ||
      ctx.series.visibleSeries.length <= 1 ||
      ctx.series.isHighlighted(series.key, true)
      ? 1
      : 0.1
  );

  /** Its rows: its own `data`, else its series' or the chart's, narrowed to its facet panel */
  const markData = getMarkData();
  const rows = $derived(markData(dataProp, series?.data) as any[]);
  const xAccessor = $derived(resolveAccessor(x, ctx.config.x));
  const yAccessor = $derived(resolveAccessor(y, ctx.config.y));
  const y0Accessor = $derived(y0 == null ? null : accessor(y0));
  const y1Accessor = $derived(y1 == null ? null : accessor(y1));

  /**
   * The chart's area bottoms and tops (as the core `Area`'s): a stack's (areas stack by nature,
   * as the chart's `seriesLayout` says), else its values over the baseline
   */
  const chartEdges = $derived(ctx.areaAccessorsFor({ seriesKey, ownData: dataProp != null }));

  /** Standing up as a curtain, rather than lying on the floor as the core `Area` fills the plot */
  const curtain = $derived(y0 == null && y1 == null && (z != null || ctx.config.z != null));

  /** As `Spline`: what splits the rows into areas */
  const gAccessor = $derived.by<((d: any) => unknown) | null>(() => {
    const gProp = g ?? (ctx.props as { g?: Accessor }).g;
    if (gProp != null) return accessor(gProp);
    const first = rows[0];
    const implied = colorPropGroupKey(fill, first) ?? colorPropGroupKey(stroke, first);
    if (implied != null) return accessor(implied);
    if (dataProp != null || series?.data != null) return null;
    return first != null && ctx.cKey(first) != null ? ctx.cKey : null;
  });

  /**
   * Each row's column: where it stands on the floor (`x`, `y`), and its two edges, `a` and `b` —
   * heights for a curtain, else positions down the plot
   */
  type Column = {
    d: any;
    x: number;
    y: number;
    a: number;
    b: number;
    /** On a `radial` chart, its base's own position across (its top's is `x`) */
    xa?: number;
  };

  /** On a `radial` chart, its rows lie about the center, as the core `Area`'s `areaRadial` */
  const radial = $derived(!!ctx.radial);

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
    if (radial) {
      // `x` an angle, and its edges radii: each edge's point about the center
      const angle = Number(ctx.xScale(xValue));
      const rTop = scaled(ctx.yScale, top);
      const rBase = base == null ? Math.min(...(ctx.yRange as number[])) : scaled(ctx.yScale, base);
      const [tx, ty] = pointRadial(angle, rTop);
      const [bx, by] = pointRadial(angle, rBase);
      return [tx, ty, bx, by].every(Number.isFinite)
        ? { d, x: tx, y: ty, a: by, b: ty, xa: bx }
        : null;
    }
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
    const along = (edge: (c: Column) => number, across = (c: Column) => c.x) =>
      curvePoints(
        columns.map((c) => [across(c), edge(c)]),
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
    // Each edge curved through its own points (on a `radial` chart, about the center)
    const bases = along(
      (c) => c.a,
      (c) => c.xa ?? c.x
    );
    return tops.map((top, i) => {
      const base = bases[Math.min(i, bases.length - 1)];
      return {
        d: near(top.at).d,
        x: top.x,
        y: top.y,
        a: base.y,
        b: top.y,
        ...(radial ? { xa: base.x } : null),
      };
    });
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

  /** An area's fill: its own `fill`, else its class's, else the chart's `c`, else its series' */
  function fillColor(d: any) {
    return rowColor(
      ctx,
      fill,
      d,
      series?.color ?? 'var(--color-primary, currentColor)',
      look?.fill,
      look?.fillSet
    );
  }

  /**
   * An area's outline, as the core `Area`'s path strokes it: its own `stroke`, or one its `class`
   * sets (ex. `stroke-primary`), else none
   */
  function outlineColor(d: any) {
    if (stroke === 'none' || (stroke == null && !look?.strokeSet)) return null;
    return rowColor(ctx, stroke, d, 'currentColor', look?.stroke, look?.strokeSet);
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
      const color = fillColor(areaRows[0]);
      const lineStroke = line ? lineColor(areaRows[0], color) : null;
      const outline = outlineColor(areaRows[0]);
      return pieces
        .filter((piece) => piece.length >= 2)
        .map((piece, k) => ({
          key: `${area}:${k}`,
          area,
          color,
          stroke: lineStroke,
          outline,
          /** Its rows' columns, before `curve` */
          rows: piece,
          columns: curved(piece),
        }));
    })
  );

  // Tweening to where they're asked to be, as core's areas (a spring leaves them, as core's), a
  // new one up from the baseline: each column as `[x, y, a, b, xa]`
  const pathMotion = createPathMotion(
    untrack(() => motion),
    5
  );
  const flat = (columns: Column[]) => columns.flatMap((c) => [c.x, c.y, c.a, c.b, c.xa ?? c.x]);
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
    if (radial) {
      // Both edges along their angle at the baseline's radius
      return columns.map((c) => {
        const [x, y] = atRadius(c.x, c.b, baseline);
        const [xa, a] = atRadius(c.xa ?? c.x, c.a, baseline);
        return { ...c, x, y, a, b: y, xa };
      });
    }
    return columns.map((c) => ({ ...c, y: baseline, a: baseline, b: baseline }));
  }

  /** Each run's columns where they are now */
  function columnsNow(run: { key: string; columns: Column[] }): Column[] {
    if (!pathMotion) return run.columns;
    const now = pathMotion.get(run.key);
    if (!now) return collapsed(run.columns);
    return run.columns.map((c, i) => ({
      ...c,
      x: now[i * 5],
      y: now[i * 5 + 1],
      a: now[i * 5 + 2],
      b: now[i * 5 + 3],
      ...(c.xa != null ? { xa: now[i * 5 + 4] } : null),
    }));
  }

  /** A column's two edges, in the scene's axes (chart x, height, chart y): its base, and its top */
  function edges(c: Column): [number[], number[]] {
    return curtain
      ? [
          [c.x, c.a, c.y],
          [c.x, c.b, c.y],
        ]
      : [
          [c.xa ?? c.x, 0.1, c.a],
          [c.x, 0.1, c.b],
        ];
  }

  /** A point of an edge, a floor area's lifted over its fill */
  function lifted([x, up, y]: number[]) {
    return [x, curtain ? up : up + LINE_LIFT, y];
  }

  /** A run's outline: along its top, back along its base, and closed, as an SVG path's stroke */
  function outlineOf(columns: Column[]) {
    return [
      ...columns.flatMap((c) => lifted(edges(c)[1])),
      ...columns
        .slice()
        .reverse()
        .flatMap((c) => lifted(edges(c)[0])),
      ...lifted(edges(columns[0])[1]),
    ];
  }

  /**
   * Where a run's outline's commands end, as indices into its points: each column, or along a
   * `curve`, its top's and its base's commands' (and where it closes)
   */
  function outlineVertices(run: { rows: Column[]; columns: Column[] }) {
    const count = run.columns.length;
    if (!curve || run.rows.length < 2) return Array.from({ length: 2 * count + 1 }, (_, i) => i);
    const along = (edge: (c: Column) => number) =>
      curveVertices(
        run.rows.map((c) => [c.x, edge(c)]),
        curve,
        run.columns.flatMap((c) => [c.x, 0, edge(c)])
      );
    return [
      ...along((c) => c.b),
      ...along((c) => c.a)
        .reverse()
        .map((k) => 2 * count - 1 - k),
      2 * count,
    ];
  }

  /** Each area's runs, as indices into `runs` */
  const areas = $derived.by(() => {
    const out: number[][] = [];
    runs.forEach((run, i) => (out[run.area] ??= []).push(i));
    return out.filter(Boolean);
  });

  /**
   * An area of one `c` category faded while the legend highlights another, as the core `Area`'s
   * (a single series draws them all, so its own fade can't tell them apart): its fill's alpha
   */
  function groupFill(color: string | null, d: any) {
    const key = color == null || d == null ? null : ctx.cKey(d);
    return key == null || ctx.series.isHighlighted(key, true)
      ? color
      : `color-mix(in srgb, ${color} 10%, transparent)`;
  }

  createMerged({
    tooltip: () => tooltip,
    items: () =>
      runs.flatMap((run) => {
        const columns = columnsNow(run);
        const positions: number[] = [];
        for (let k = 0; k < columns.length - 1; k++) {
          const [a0, a1] = edges(columns[k]);
          const [b0, b1] = edges(columns[k + 1]);
          // Its top crossing its base between columns (ex. values from positive to negative over
          // a zero baseline): two triangles meeting where they cross, as SVG fills the path's
          // two loops, rather than a quad folded over itself
          const h0 = columns[k].b - columns[k].a;
          const h1 = columns[k + 1].b - columns[k + 1].a;
          if (h0 * h1 < 0) {
            const t = h0 / (h0 - h1);
            const at = (p: number[], q: number[]) => p.map((v, i) => v + (q[i] - v) * t);
            const base = at(a0, b0);
            const top = at(a1, b1);
            const cross = base.map((v, i) => (v + top[i]) / 2);
            positions.push(...a0, ...cross, ...a1, ...cross, ...b0, ...b1);
          } else {
            positions.push(...a0, ...b0, ...a1, ...a1, ...b0, ...b1);
          }
        }
        // Explicit `pathData` fills in its place (its line, as asked, still from the rows)
        let geometry: BufferGeometry | null = null;
        if (!pathData && positions.length) {
          geometry = new BufferGeometry();
          geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
          geometry.computeVertexNormals();
        }
        return {
          d: columns[0].d,
          geometry,
          fill: groupFill(run.color, columns[0].d),
          // On the floor, a little above the fill, so all its width draws over it (a depth
          // offset alone isn't enough on every GPU for lines in the fill's own plane)
          lines: line ? [columns.flatMap((c) => lifted(edges(c)[1]))] : [],
          stroke: run.stroke,
        };
      }),
    opacity: () => opacity * fillOpacity * seriesOpacity * (look?.opacity ?? 1),
    lineOpacity: () => seriesOpacity,
    strokeWidth: () => strokeWidth,
  });
</script>

<!-- Explicit path data, filled (and outlined) as the core `Area`'s path draws it -->
{#if pathData}
  <PathWebGL
    {pathData}
    {draw}
    {marker}
    {markerMid}
    {markerStart}
    {markerEnd}
    {startContent}
    {endContent}
    fill={fillColor(rows[0])}
    stroke={outlineColor(rows[0])}
    {strokeWidth}
    {strokeOpacity}
    class={className}
    opacity={opacity * seriesOpacity}
    {fillOpacity}
    {motion}
  />
{:else if startContent || endContent || runs.some((run) => run.outline)}
  <!-- Its outline (with a `stroke`), and what goes on it -->
  <AreaOutline
    outlines={() =>
      areas.map((members): Outline => {
        const pieces = members.map((i) => runs[i]);
        return {
          subpaths: pieces.map((run) => outlineOf(columnsNow(run))),
          color: pieces[0].outline,
          vertices: () => {
            let offset = 0;
            return pieces.flatMap((run) => {
              const own = outlineVertices(run).map((k) => offset + k);
              offset += 2 * run.columns.length + 1;
              return own;
            });
          },
        };
      })}
    lengths={() =>
      areas.map((members) =>
        members.reduce((sum, i) => sum + lengthOf(outlineOf(runs[i].columns)), 0)
      )}
    {draw}
    {marker}
    {markerMid}
    {markerStart}
    {markerEnd}
    {startContent}
    {endContent}
    {strokeWidth}
    opacity={opacity * strokeOpacity * seriesOpacity * (look?.opacity ?? 1)}
  />
{/if}
