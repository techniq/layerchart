<script lang="ts" module>
  import type { LinkProps } from './Link.shared.svelte.js';
</script>

<script lang="ts">
  import { curveBumpX, curveBumpY } from 'd3-shape';
  import { ShapeGeometry, ShapePath } from 'three';
  import { getChartContext, isDataProp } from 'layerchart';
  import {
    getLinkD3Path,
    getLinkPresetPath,
    getLinkRadialD3Path,
    getLinkRadialPresetPath,
  } from 'layerchart/utils/linkUtils';
  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { flattenPath } from '../../utils/path.js';

  import { getSphere, type ScenePoint } from '../../utils/globe.js';
  import { markRows, placeOf, rowColor } from '../../utils/marks.js';
  import { untrack } from 'svelte';
  import { createMerged } from '../../utils/merged.svelte.js';
  import { createPathMotion } from '../../utils/rowMotion.svelte.js';
  import { valueOf } from '../../utils/values.js';
  import LineMarkers from '../Line/Line.markers.svelte';
  import { pathVertices } from '../Line/markers.js';
  import PathEnds from '../Path/Path.ends.svelte';
  import { createDraw, lengthOf, pathEnds, truncate } from '../Path/draw.svelte.js';

  let {
    x1,
    y1,
    x2,
    y2,
    z1,
    z2,
    data,
    sankey = false,
    source: sourceProp,
    target: targetProp,
    x: xProp,
    y: yProp,
    type = 'd3',
    radius = 20,
    bend = 22.5,
    curve: curveProp,
    sweep: sweepProp,
    orientation: orientationProp,
    radial: radialProp,
    marker,
    markerMid,
    markerStart,
    markerEnd,
    motion,
    class: className,
    pathData: pathDataProp,
    draw,
    startContent,
    endContent,
    z,
    fill,
    fillOpacity = 1,
    stroke,
    strokeOpacity = 1,
    strokeWidth: strokeWidthProp,
    opacity = 1,
    arc = 0,
  }: LinkProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets */
  const look = $derived(scene.style(className));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);
  /** Its rows: `data` as given, or one link (as the core `Link` takes it) */
  const rows = $derived(Array.isArray(data) ? data : data != null ? [data] : undefined);
  const sphere = $derived(getSphere(ctx));

  const radial = $derived(radialProp ?? ctx.radial ?? false);
  const orientation = $derived(orientationProp ?? (sankey ? 'horizontal' : 'vertical'));

  // As the core `Link`: a node's `x` across and `y` down (swapped across a horizontal tree; a
  // `Sankey` link from its source's right edge to its target's left, at its own `y0` / `y1`;
  // an angle and radius around a radial one), along a bump curve in the tree's direction, or a
  // preset path's shape
  const source = $derived(
    sourceProp ??
      (sankey ? (d: any) => ({ node: d.source, y: d.y0, isSource: true }) : (d: any) => d.source)
  );
  const target = $derived(
    targetProp ??
      (sankey ? (d: any) => ({ node: d.target, y: d.y1, isSource: false }) : (d: any) => d.target)
  );
  const x = $derived(
    xProp ??
      (sankey
        ? (end: any) => (end.isSource ? end.node.x1 : end.node.x0)
        : radial
          ? (node: any) => node.x
          : (node: any) => (orientation === 'horizontal' ? node.y : node.x))
  );
  const y = $derived(
    yProp ??
      (sankey || radial
        ? (node: any) => node.y
        : (node: any) => (orientation === 'horizontal' ? node.x : node.y))
  );
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
    if (from[0] === to[0] && from[1] === to[1] && !pathDataProp) return [from, to];
    const source = { x: from[0], y: from[1] };
    const target = { x: to[0], y: to[1] };
    const d = pathData(source, target);
    const points = d ? flattenPath(d) : [];
    return points.length >= 2 ? points : [from, to];
  }

  /** The core `Link`'s path data between two points (its own `pathData`, when given one) */
  function pathData(source: { x: number; y: number }, target: { x: number; y: number }) {
    if (pathDataProp) return typeof pathDataProp === 'function' ? pathDataProp() : pathDataProp;
    if (radial) {
      return type === 'd3'
        ? getLinkRadialD3Path({ source, target, curve })
        : getLinkRadialPresetPath({ source, target, type, radius, bend });
    }
    return type === 'd3'
      ? getLinkD3Path({ source, target, sweep, curve, orientation })
      : getLinkPresetPath({ source, target, sweep, type, radius, bend });
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

  /** How far `z` raises every link, as the core `Path` raises an unfilled path: to its top */
  const raised = $derived(Array.isArray(z) ? z[1] : (z ?? 0));

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
        (sphere || lift) && !pathDataProp
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
        line.push(px, sz + (tz - sz) * t + up + raised, py);
      });
      const straight = (sphere || lift) && !pathDataProp;
      return {
        d,
        line,
        /** Its path data across the floor, as the core `Link`'s (`null` when drawn straight) */
        path: straight ? null : () => pathData({ x: sx, y: sy }, { x: tx, y: ty }),
        /** Its floor path, when it lies flat at one height (filled between its ends with a `fill`) */
        flat: !straight && sz === tz ? floor : null,
        fill:
          (look?.fillSet ? look.fill : null) ??
          (typeof fill === 'function' ? fill(d) : fill) ??
          (look?.fill && look.fill !== 'none' ? look.fill : null),
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

  /** Each link's points where they are now */
  const drawn = $derived(links.map((link, i) => pathMotion?.get(i) ?? link.line));

  // Drawing each link from its start, as the core `Link`'s path's `draw`: again whenever the links
  // change
  const drawing = untrack(() => draw)
    ? createDraw(
        () => draw,
        () => links.map((link) => lengthOf(link.line))
      )
    : null;
  /** How much of each link is drawn so far (all of it without `draw`) */
  const progress = $derived(drawing ? drawn.map((line) => drawing.progress(lengthOf(line))) : null);

  createMerged({
    items: () =>
      links.map((link, i) => {
        const line = drawn[i];
        const filled = link.fill != null && link.fill !== 'none' && link.flat != null;
        let geometry: ShapeGeometry | null = null;
        if (filled) {
          // Between its path and the chord across its ends, as an SVG path fills an open one
          const shape = new ShapePath();
          for (let k = 0; k < line.length; k += 3)
            shape[k ? 'lineTo' : 'moveTo'](line[k], line[k + 2]);
          geometry = new ShapeGeometry(shape.toShapes())
            .rotateX(Math.PI / 2)
            .translate(0, line[1] - 0.2, 0);
        }
        const p = progress?.[i] ?? 1;
        return {
          d: link.d,
          geometry,
          fill: filled ? link.fill : null,
          lines: [p < 1 ? truncate(line, p * lengthOf(line)) : line],
          stroke: link.stroke,
        };
      }),
    opacity: () => opacity * fillOpacity * (look?.opacity ?? 1),
    lineOpacity: () => opacity * strokeOpacity * (look?.opacity ?? 1),
    strokeWidth: () => strokeWidth,
  });
</script>

{#if marker || markerStart || markerMid || markerEnd}
  <LineMarkers
    {marker}
    {markerStart}
    {markerMid}
    {markerEnd}
    lines={() =>
      links.map((link, i) => ({
        points: drawn[i],
        color: link.stroke,
        // Where its path's commands end (ex. a `square` link's corners), for `markerMid` alone
        get mids() {
          const d = link.path?.();
          return d ? pathVertices(d) : [];
        },
      }))}
    {strokeWidth}
    opacity={opacity * (look?.opacity ?? 1)}
  />
{/if}

{#if startContent || endContent}
  {#each drawn as line, i (i)}
    {@const ends = pathEnds([line], progress?.[i] ?? 1)}
    {#if ends}
      <PathEnds start={ends.start} end={ends.end} {startContent} {endContent} />
    {/if}
  {/each}
{/if}
