<script lang="ts" module>
  import type { PathProps } from './Path.shared.svelte.js';
</script>

<!-- SVG path data on the floor, as the core `Path` draws it: filled between its subpaths, and outlined -->
<script lang="ts">
  import { untrack } from 'svelte';
  import { ShapeGeometry, ShapePath } from 'three';
  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { createMerged } from '../../utils/merged.svelte.js';
  import { parsePath, type Subpath } from '../../utils/path.js';
  import { createPathMotion } from '../../utils/rowMotion.svelte.js';
  import LineMarkers from '../Line/Line.markers.svelte';
  import { pathVertices } from '../Line/markers.js';
  import PathEnds from './Path.ends.svelte';
  import { createDraw, drawnSubpaths, lengthOf, pathEnds } from './draw.svelte.js';

  let {
    pathData,
    draw,
    marker,
    markerMid,
    markerStart,
    markerEnd,
    startContent,
    endContent,
    motion,
    z = 0,
    fill,
    fillOpacity = 1,
    stroke,
    strokeWidth: strokeWidthProp,
    strokeOpacity = 1,
    opacity = 1,
    class: className,
  }: PathProps = $props();

  const scene = getSceneContext();
  /** What its `class` sets */
  const look = $derived(scene.style(className));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);

  const d = $derived(typeof pathData === 'function' ? pathData() : pathData);
  const subpaths = $derived(d ? parsePath(d) : []);
  /** How far above the floor it lies */
  const height = $derived(Array.isArray(z) ? z[1] : z);

  // A class's own fill and stroke win over the props, as CSS does in core's layers
  const fillColor = $derived((look?.fillSet ? look.fill : null) ?? fill ?? look?.fill ?? null);
  const filled = $derived(fillColor != null && fillColor !== 'none');
  const strokeColor = $derived(
    (look?.strokeSet ? look.stroke : null) ??
      stroke ??
      look?.stroke ??
      (filled ? null : 'var(--color-surface-content, currentColor)')
  );
  const outlined = $derived(strokeColor != null && strokeColor !== 'none' && strokeWidth > 0);

  // Tweening to new path data, as the core `Path`: all its points at once, as `[x, y]`
  const pathMotion = createPathMotion(
    untrack(() => motion),
    2
  );
  const flat = $derived(subpaths.flatMap((s) => s.points.flat()));
  if (pathMotion) {
    $effect(() => {
      const points = flat;
      untrack(() => pathMotion.update(0, points));
    });
  }
  /** The subpaths where they are now */
  const drawn = $derived.by<Subpath[]>(() => {
    const now = pathMotion?.get(0);
    if (!now) return subpaths;
    let k = 0;
    return subpaths.map((s) => ({
      closed: s.closed,
      points: s.points.map((): [number, number] => {
        const point: [number, number] = [now[k], now[k + 1]];
        k += 2;
        return point;
      }),
    }));
  });

  /** A little above its fill, so its outline draws over it, as `Area`'s */
  const LINE_LIFT = 0.3;

  /** Its subpaths' outlines where they are now, in the scene's axes (across, up, down the plot) */
  const outlines = $derived(
    drawn.map(({ points }) => points.flatMap(([px, py]) => [px, height + 0.1 + LINE_LIFT, py]))
  );

  // Drawing the outline from its start, as the core `Path`'s `draw` (an SVG `draw` transition):
  // again whenever the path data changes
  const drawing = untrack(() => draw)
    ? createDraw(
        () => draw,
        () => [
          subpaths.reduce((sum, s) => sum + lengthOf(s.points.flatMap(([x, y]) => [x, 0, y])), 0),
        ]
      )
    : null;
  /** How much of it is drawn so far (all of it without `draw`) */
  const progress = $derived(
    drawing ? drawing.progress(outlines.reduce((sum, s) => sum + lengthOf(s), 0)) : 1
  );

  createMerged({
    items: () => {
      if (!drawn.length) return [];
      let geometry: ShapeGeometry | null = null;
      if (filled) {
        const shape = new ShapePath();
        for (const { points } of drawn) {
          shape.moveTo(...points[0]);
          for (const point of points.slice(1)) shape.lineTo(...point);
        }
        // Holes (ex. a contour's) found inside the shapes around them
        // In the scene's axes: across, up off the floor, and down the plot
        geometry = new ShapeGeometry(shape.toShapes())
          .rotateX(Math.PI / 2)
          .translate(0, height + 0.1, 0);
      }
      return [
        {
          d: undefined,
          geometry,
          fill: filled ? fillColor : null,
          // Each subpath from its own start, as SVG dashes it
          lines: outlined ? drawnSubpaths(outlines, progress) : [],
          stroke: outlined ? strokeColor : null,
        },
      ];
    },
    opacity: () => opacity * fillOpacity * (look?.opacity ?? 1),
    lineOpacity: () => opacity * strokeOpacity * (look?.opacity ?? 1),
    strokeWidth: () => strokeWidth,
    once: true,
  });

  /** Where `marker-mid` goes: each command's end between its first and last (read only for it) */
  const vertices = $derived(d ? pathVertices(d) : []);

  /** Where `startContent` / `endContent` go, as the core `Path` places them (following `draw`) */
  const ends = $derived(startContent || endContent ? pathEnds(outlines, progress) : null);
</script>

{#if outlined && (marker || markerStart || markerMid || markerEnd)}
  <LineMarkers
    {marker}
    {markerStart}
    {markerMid}
    {markerEnd}
    lines={() => [
      {
        points: outlines.flat(),
        color: strokeColor!,
        get mids() {
          return vertices;
        },
      },
    ]}
    {strokeWidth}
    opacity={opacity * (look?.opacity ?? 1)}
  />
{/if}

{#if ends}
  <PathEnds start={ends.start} end={ends.end} {startContent} {endContent} />
{/if}
