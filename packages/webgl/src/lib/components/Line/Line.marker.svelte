<script lang="ts" module>
  import type { MarkedLine, MarkerOptions } from './markers.js';
</script>

<!-- One of a line's markers (its start's, its middle's, or its end's), as the core `Marker` draws it: a small shape in the line's color, turned along it -->
<script lang="ts">
  import { createMerged, type MergedItem } from '../../utils/merged.svelte.js';
  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { ShapeContext, extrude } from '../../utils/shapes.js';

  let {
    marker,
    at,
    lines,
    strokeWidth = 1,
    opacity = 1,
  }: {
    marker: MarkerOptions;
    /** Which of each line's points it marks */
    at: 'start' | 'mid' | 'end';
    lines: MarkedLine[];
    /** The lines' width, for `markerUnits="strokeWidth"` */
    strokeWidth?: number;
    opacity?: number;
  } = $props();

  const scene = getSceneContext();

  /** The core `Marker`'s props, with its defaults */
  const options = $derived.by(() => {
    if (typeof marker === 'function') return null;
    const props = typeof marker === 'string' ? { type: marker } : marker;
    const type = props.type;
    if (!type) return null;
    const size = props.size ?? 10;
    const [, , boxWidth = 10, boxHeight = 10] = (props.viewBox ?? '0 0 10 10')
      .split(/[\s,]+/)
      .map(Number);
    // Fitted into its width and height, as SVG fits a `viewBox` by default
    let scale = Math.min(
      Number(props.markerWidth ?? size) / boxWidth,
      Number(props.markerHeight ?? size) / boxHeight
    );
    if (props.markerUnits === 'strokeWidth') scale *= strokeWidth;
    return {
      type,
      scale,
      refX: Number(props.refX ?? (type === 'arrow' || type === 'triangle' ? 9 : 5)),
      refY: Number(props.refY ?? 5),
      orient: props.orient ?? 'auto-start-reverse',
      class: typeof props.class === 'string' ? props.class : undefined,
    };
  });
  /** What its `class` sets (ex. `fill-red-500`), over the line's color, as CSS does in core */
  const look = $derived(scene.style(options?.class));

  /** The way from point `i` to the next point elsewhere (`step` 1) or from the last (-1) */
  function heading(points: ArrayLike<number>, i: number, step: 1 | -1): number | null {
    const x = points[3 * i];
    const y = points[3 * i + 2];
    for (let j = i + step; j >= 0 && j < points.length / 3; j += step) {
      const dx = points[3 * j] - x;
      const dy = points[3 * j + 2] - y;
      if (dx || dy) return step > 0 ? Math.atan2(dy, dx) : Math.atan2(-dy, -dx);
    }
    return null;
  }

  /** Each point it marks, and the way it turns there (radians, clockwise on the plot) */
  const placements = $derived.by(() => {
    if (!options) return [];
    const fixed = typeof options.orient === 'number' ? (options.orient * Math.PI) / 180 : null;
    const marks: { i: number; angle: number; line: MarkedLine }[] = [];
    for (const line of lines) {
      const count = Math.floor(line.points.length / 3);
      if (count < 2) continue;
      const indices = at === 'start' ? [0] : at === 'end' ? [count - 1] : (line.mids ?? []);
      for (const i of indices) {
        if (i < 0 || i >= count) continue;
        let angle = fixed;
        if (angle == null) {
          const ahead = heading(line.points, i, 1);
          const behind = heading(line.points, i, -1);
          if (at === 'start') {
            angle = (ahead ?? 0) + (options.orient === 'auto-start-reverse' ? Math.PI : 0);
          } else if (at === 'end') angle = behind ?? 0;
          else {
            // Halfway between the ways in and out, as SVG turns a mid marker
            const a = behind ?? ahead ?? 0;
            const b = ahead ?? a;
            angle = Math.atan2(Math.sin(a) + Math.sin(b), Math.cos(a) + Math.cos(b));
          }
        }
        marks.push({ i, angle, line });
      }
    }
    return marks;
  });

  /** A circle's points, in the marker's own units */
  const CIRCLE = Array.from({ length: 24 }, (_, k): [number, number] => [
    5 + 5 * Math.cos((k / 24) * 2 * Math.PI),
    5 + 5 * Math.sin((k / 24) * 2 * Math.PI),
  ]);

  /** The marker's outline in its own units (`0` to `10`), and whether it's closed */
  function outline(type: string): { points: [number, number][]; closed: boolean } {
    switch (type) {
      case 'triangle':
      case 'arrow':
        return {
          points: [
            [0, 0],
            [10, 5],
            [0, 10],
          ],
          closed: type === 'triangle',
        };
      case 'line':
        return {
          points: [
            [5, 0],
            [5, 10],
          ],
          closed: false,
        };
      case 'square':
      case 'square-stroke':
        return {
          points: [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
          ],
          closed: true,
        };
      default:
        return { points: CIRCLE, closed: true };
    }
  }

  /** The surface color the core marker fills or rings a shape with */
  const SURFACE = 'var(--color-surface-100, white)';
  /** Above the line, so it draws over it */
  const LIFT = 0.2;

  createMerged({
    items: () => {
      if (!options) return [];
      const { type, scale, refX, refY } = options;
      const shape = outline(type);
      // As the core `Marker`'s styles color each type: its fill and its stroke, from the line's
      // color (`context-stroke`) or the surface's
      const fills =
        type === 'arrow' || type === 'line'
          ? null
          : type === 'circle-stroke' || type === 'square-stroke'
            ? 'surface'
            : 'line';
      const strokes =
        type === 'triangle' || type === 'dot' || type === 'square'
          ? null
          : type === 'circle'
            ? 'surface'
            : 'line';
      return placements.map(({ i, angle, line }): MergedItem => {
        const x = line.points[3 * i];
        const h = line.points[3 * i + 1] + LIFT;
        const y = line.points[3 * i + 2];
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const points = shape.points.map(([u, v]): [number, number] => {
          const px = (u - refX) * scale;
          const py = (v - refY) * scale;
          return [x + px * cos - py * sin, y + px * sin + py * cos];
        });
        let geometry = null;
        if (fills) {
          const context = new ShapeContext();
          points.forEach(([px, py], k) => (k ? context.lineTo(px, py) : context.moveTo(px, py)));
          context.closePath();
          geometry = extrude(context, h, h);
        }
        const ring = shape.closed ? [...points, points[0]] : points;
        const color = (role: 'surface' | 'line' | null, set: boolean, classed: string | null) =>
          role == null
            ? null
            : set && classed
              ? classed
              : role === 'surface'
                ? SURFACE
                : line.color;
        return {
          d: undefined,
          geometry,
          fill: color(fills, !!look?.fillSet, look?.fill ?? null),
          lines: strokes ? [ring.flatMap(([px, py]) => [px, h + 0.1, py])] : [],
          stroke: color(strokes, !!look?.strokeSet, look?.stroke ?? null),
        };
      });
    },
    opacity: () => opacity * (look?.opacity ?? 1),
    lineOpacity: () => opacity * (look?.opacity ?? 1),
    // As an SVG marker's outline, a unit of its own wide
    strokeWidth: () => (look?.strokeWidth ?? 1) * (options?.scale ?? 1),
  });
</script>
