<script lang="ts" module>
  import type { Accessor } from 'layerchart';
  import type { SplineProps } from './Spline.shared.svelte.js';
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { Vector3 } from 'three';
  import { Line2 } from 'three/addons/lines/Line2.js';
  import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
  import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
  import { group } from 'd3-array';
  import { accessor, colorPropGroupKey, getChartContext } from 'layerchart';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { getSphere, sphereArc } from '../../utils/globe.js';
  import { curvePoints } from '../../utils/curve.js';
  import { defined, position, resolveAccessor, rowColor } from '../../utils/marks.js';
  import { createPathMotion } from '../../utils/rowMotion.svelte.js';
  import LineMarkers from '../Line/Line.markers.svelte';
  import { curveVertices } from '../Line/markers.js';
  import PathEnds from '../Path/Path.ends.svelte';
  import PathWebGL from '../Path/Path.webgl.svelte';
  import { createDraw, drawnSubpaths, lengthOf, pathEnds } from '../Path/draw.svelte.js';
  import SplineFill from './Spline.fill.svelte';

  let {
    data: dataProp,
    x,
    y,
    z,
    g,
    seriesKey,
    stroke,
    strokeWidth: strokeWidthProp,
    class: className,
    opacity = 1,
    curve,
    defined: definedProp,
    tooltip = false,
    motion,
    fill: fillProp,
    pathData,
    draw,
    marker,
    markerMid,
    markerStart,
    markerEnd,
    startContent,
    endContent,
    fillOpacity = 1,
    strokeOpacity = 1,
  }: SplineProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** Its objects, stacked with other marks' in the order they're declared */
  const layer = scene.layer();
  /** What its `class` sets */
  const look = $derived(scene.style(className));
  // 1px unless asked, as an SVG line's
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);

  ctx.registerComponent({
    name: 'Spline',
    kind: 'mark',
    markInfo: () => ({
      data: dataProp,
      x,
      y,
      seriesKey,
      color: typeof stroke === 'string' ? stroke : undefined,
    }),
  });

  /**
   * The series it draws, as the core `Spline`: its rows, value, and color.  Looked up only with a
   * `seriesKey`, so lines without one don't read the series state.
   */
  const series = $derived(
    seriesKey == null ? undefined : ctx.series.series.find((s) => s.key === seriesKey)
  );
  const seriesAccessor = $derived(
    seriesKey == null ? undefined : ctx.series.valueAccessor(seriesKey)
  );
  /** Faded while another series is highlighted, as the core `Spline` */
  const seriesOpacity = $derived(
    series == null ||
      ctx.series.visibleSeries.length <= 1 ||
      ctx.series.isHighlighted(series.key, true)
      ? 1
      : 0.1
  );

  const sphere = $derived(getSphere(ctx));
  const xAccessor = $derived(
    resolveAccessor(x ?? (ctx.valueAxis === 'x' ? seriesAccessor : undefined), ctx.config.x)
  );
  /**
   * A line in a stack follows its top, as the core `Spline` (ex. over a stacked `Area`), when the
   * chart stacks (`seriesLayout`) and the line reads its rows
   */
  const stack = $derived(ctx.stackAccessorsFor({ seriesKey, ownData: dataProp != null }));
  const yAccessor = $derived(
    y == null && ctx.valueAxis === 'y' && stack
      ? stack.y1
      : resolveAccessor(y ?? (ctx.valueAxis === 'y' ? seriesAccessor : undefined), ctx.config.y)
  );
  const rows = $derived((dataProp ?? series?.data ?? ctx.data ?? []) as any[]);

  /**
   * What splits the rows into lines: this mark's `g`, the chart's `g`, the categorical data key
   * `stroke` names, then the chart's `c` — what colors the lines splits them.  Rows the mark was handed
   * itself are taken as already grouped.
   */
  const gAccessor = $derived.by<((d: any) => unknown) | null>(() => {
    const gProp = g ?? (ctx.props as { g?: Accessor }).g;
    if (gProp != null) return accessor(gProp);
    const first = rows[0];
    const implied = colorPropGroupKey(stroke, first);
    if (implied != null) return accessor(implied);
    if (dataProp != null || series?.data != null) return null;
    return first != null && ctx.cKey(first) != null ? ctx.cKey : null;
  });

  type Segment = {
    positions: number[];
    colors: string[];
    data: any[];
    /** Which of its rows' lines it's a piece of (a gap breaks one into pieces) */
    group: number;
    /** On a globe, which of its points are its rows' (the rest arc between them) */
    rowPoints?: number[];
    /** Along a `curve`, the points it was drawn through, on the floor */
    floor?: [number, number][];
  };

  /** Its lines, broken into pieces where a row isn't drawn (none with its own `pathData`) */
  const lines = $derived(
    (pathData != null ? [] : gAccessor ? [...group(rows, gAccessor).values()] : [rows])
      .flatMap((lineRows, groupIndex) => {
        const segments: Segment[] = [];
        let line: Segment = { positions: [], colors: [], data: [], group: groupIndex };
        /** A gap: the line so far is one segment, and the next row starts another */
        const breakLine = () => {
          if (line.data.length) segments.push(line);
          line = { positions: [], colors: [], data: [], group: groupIndex };
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
            series?.color ?? 'var(--color-primary, currentColor)',
            look?.stroke,
            look?.strokeSet
          );
          if (sphere) {
            // Over the globe, along the great circle from the last row
            const here: [number, number, number] = [Number(xValue), Number(yValue), height];
            const arc = previous ? sphereArc(sphere, previous, here) : sphere.toScene(...here);
            (line.rowPoints ??= []).push(
              line.positions.length / 3 + (previous ? arc.length / 3 - 2 : 0)
            );
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
  function curved(line: Segment): Segment {
    const count = line.data.length;
    if (count < 2 || !curve) return line;
    const floor: [number, number][] = [];
    const heights: number[] = [];
    for (let i = 0; i < count; i++) {
      floor.push([line.positions[i * 3], line.positions[i * 3 + 2]]);
      heights.push(line.positions[i * 3 + 1]);
    }
    const out: Segment = { positions: [], colors: [], data: [], group: line.group, floor };
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

  // Tweening to where they're asked to be, as core's lines (a spring leaves them, as core's), a
  // new one up from the baseline
  const pathMotion = createPathMotion(untrack(() => motion));
  if (pathMotion) {
    $effect(() => {
      const active = new Set<unknown>();
      lines.forEach((line, i) => {
        active.add(i);
        untrack(() => pathMotion.update(i, line.positions, flattened(line.positions)));
      });
      untrack(() => pathMotion.cleanup(active));
    });
  }

  /** A line's points flat on the baseline, where core's lines tween in from (none on a globe) */
  function flattened(positions: number[]) {
    if (sphere) return undefined;
    const zero = Number(ctx.yScale(0));
    const baseline = Math.min(Number.isFinite(zero) ? zero : ctx.yRange[0], ctx.yRange[0]);
    return positions.map((v, i) => (i % 3 === 2 ? baseline : v));
  }

  /** Its fill: its class's own, else `fill`, else its class's `--fill-color` (none by default) */
  const fillColor = $derived.by(() => {
    const color = (look?.fillSet ? look.fill : null) ?? fillProp ?? null;
    return color && color !== 'none' ? color : null;
  });

  /** Each line's points where they are now */
  const drawn = $derived(
    lines.map(
      (line, i) =>
        (pathMotion ? (pathMotion.get(i) ?? flattened(line.positions)) : null) ?? line.positions
    )
  );

  /** Each line's segments (its pieces between gaps), as indices into `lines` */
  const groups = $derived.by(() => {
    const out: number[][] = [];
    lines.forEach((line, i) => (out[line.group] ??= []).push(i));
    return out.filter(Boolean);
  });

  // Drawing each line from its start, as the core `Spline`'s `draw` (its path's): again whenever
  // the lines change
  const drawing = untrack(() => draw)
    ? createDraw(
        () => draw,
        () =>
          groups.map((members) => members.reduce((sum, i) => sum + lengthOf(lines[i].positions), 0))
      )
    : null;
  /** How much of each line is drawn so far, by its group (all of it without `draw`) */
  const progress = $derived(
    groups.map((members) =>
      drawing ? drawing.progress(members.reduce((sum, i) => sum + lengthOf(drawn[i]), 0)) : 1
    )
  );
  /** Each segment as far as it's drawn: from its own start, as SVG dashes each piece of a path */
  const shown = $derived.by(() => {
    if (!drawing || drawing.done) return drawn;
    const out = drawn.slice();
    groups.forEach((members, g) => {
      const cut = drawnSubpaths(
        members.map((i) => drawn[i]),
        progress[g]
      );
      members.forEach((i, k) => (out[i] = cut[k]));
    });
    return out;
  });

  /** Set a line's points (fewer as `draw` draws it), and its colors to match */
  function place(line: Line2, points: number[]) {
    const count = Math.floor(points.length / 3);
    // A single point would still draw its round cap
    line.visible = count >= 2;
    if (count < 2) return;
    line.geometry.setPositions(points);
    if (line.userData.count !== count) {
      line.geometry.setColors((line.userData.rgb as number[]).slice(0, count * 3));
      line.userData.count = count;
    }
  }

  /** The lines' objects, whose points `drawn` moves */
  let objects = $state.raw<{ line: Line2; removePickable: (() => void) | null }[]>([]);

  $effect(() => {
    const created = lines.map(({ positions, colors, data }, index) => {
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
      const lineOpacity = opacity * strokeOpacity * (look?.opacity ?? 1) * alpha;
      const faded = lineOpacity * untrack(() => seriesOpacity);
      const material = new LineMaterial({
        vertexColors: true,
        linewidth: strokeWidth,
        transparent: faded < 1,
        opacity: faded,
      });
      const line = new Line2(geometry, material);
      line.userData.opacity = lineOpacity;
      line.userData.rgb = rgb;
      line.userData.count = positions.length / 3;
      // As far as it's drawn, or where it tweens from
      if (pathMotion || drawing)
        place(
          line,
          untrack(() => shown[index] ?? positions)
        );
      layer.add(line);
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
    objects = created;
    scene.invalidate();

    return () => {
      for (const { line, removePickable } of created) {
        removePickable?.();
        layer.remove(line);
        line.geometry.dispose();
        line.material.dispose();
      }
      scene.invalidate();
    };
  });

  // Fading with its series as the legend highlights another, without making the lines again
  if (untrack(() => seriesKey) != null) {
    $effect(() => {
      const fade = seriesOpacity;
      for (const { line } of untrack(() => objects)) {
        const material = line.material;
        material.opacity = line.userData.opacity * fade;
        if (material.transparent !== material.opacity < 1) {
          material.transparent = material.opacity < 1;
          material.needsUpdate = true;
        }
      }
      scene.invalidate();
    });
  }

  // Moving the lines' points as they tween (or `draw` draws them), without making them again
  $effect(() => {
    if (!pathMotion && !drawing) return;
    const points = shown;
    untrack(() => objects).forEach(({ line }, i) => {
      if (points[i]) place(line, points[i]);
    });
    scene.invalidate();
  });

  /**
   * Where a line's path's commands end, as indices into its segments' points end to end: each
   * row's point, or along a `curve`, each of its commands' (read only for `markerMid`)
   */
  function vertices(members: number[]) {
    const out: number[] = [];
    let offset = 0;
    for (const i of members) {
      const line = lines[i];
      const own = line.floor
        ? curveVertices(line.floor, curve!, line.positions)
        : (line.rowPoints ?? line.data.map((_, k) => k));
      for (const k of own) out.push(offset + k);
      offset += line.positions.length / 3;
    }
    return out;
  }
</script>

<!-- Explicit path data, drawn in its place, as the core `Spline` hands it to its path -->
{#if pathData != null}
  <PathWebGL
    {pathData}
    {draw}
    {marker}
    {markerMid}
    {markerStart}
    {markerEnd}
    {startContent}
    {endContent}
    {motion}
    fill={fillColor}
    {fillOpacity}
    stroke={rowColor(
      ctx,
      stroke,
      rows[0],
      series?.color ?? 'var(--color-primary, currentColor)',
      look?.stroke,
      look?.strokeSet
    )}
    {strokeWidth}
    {strokeOpacity}
    opacity={opacity * seriesOpacity}
    class={className}
  />
{/if}

{#if pathData == null && (marker || markerStart || markerMid || markerEnd)}
  <LineMarkers
    {marker}
    {markerStart}
    {markerMid}
    {markerEnd}
    lines={() =>
      groups.map((members) => ({
        // One path through its segments, as the core `Spline`'s
        points: members.flatMap((i) => drawn[i] ?? lines[i].positions),
        color: lines[members[0]].colors[0],
        // Each vertex between its ends (a gap's ends too, as an SVG path's subpaths')
        get mids() {
          return vertices(members).slice(1, -1);
        },
      }))}
    {strokeWidth}
    opacity={opacity * seriesOpacity * (look?.opacity ?? 1)}
  />
{/if}

{#if pathData == null && (startContent || endContent)}
  {#each groups as members, g (g)}
    {@const ends = pathEnds(
      members.map((i) => drawn[i] ?? lines[i].positions),
      progress[g]
    )}
    {#if ends}
      <PathEnds start={ends.start} end={ends.end} {startContent} {endContent} />
    {/if}
  {/each}
{/if}

<!-- Filled only with a `fill` (here or in `class`), as the core `Spline`: the shape its line closes around -->
{#if fillColor}
  <SplineFill
    lines={lines.map((line, i) => ({ positions: drawn[i] ?? line.positions, data: line.data }))}
    fill={fillColor}
    opacity={opacity * fillOpacity * seriesOpacity * (look?.opacity ?? 1)}
  />
{/if}
