<script lang="ts" module>
  import type { EllipseProps } from 'layerchart';

  /** Points round an ellipse */
  const SEGMENTS = 48;

  /** A style prop's number, else `fallback` (one per ellipse isn't drawn: they share a mesh) */
  function num(value: unknown, fallback: number) {
    const n = typeof value === 'string' ? parseFloat(value) : value;
    return typeof n === 'number' && Number.isFinite(n) ? n : fallback;
  }
</script>

<!-- LayerChart's `Ellipse`: each a flat shape on the floor, placed as the core `Ellipse` places it,
     filled and outlined as its fill and stroke ask -->
<script lang="ts">
  import { Shape, ShapeGeometry, Vector2 } from 'three';
  import { EllipseState } from 'layerchart/base';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { createMerged } from '../../utils/merged.svelte.js';
  import { rowColor } from '../../utils/marks.js';

  let props: EllipseProps = $props();

  const c = new EllipseState(() => props);
  const scene = getSceneContext();
  /** What its `class` sets */
  const look = $derived(
    scene.style(
      ['lc-ellipse', typeof props.class === 'string' ? props.class : ''].join(' ').trim(),
      typeof props.style === 'string' && props.style ? { style: props.style } : undefined
    )
  );

  /** A pixel-mode ellipse's row, so the pointer picks it (its handlers are called without one) */
  const PIXEL_ROW = {};

  /** Each ellipse where it is now */
  const ellipses = $derived(
    c.dataMode
      ? c.resolvedItems
      : [{ d: PIXEL_ROW, cx: c.motionCx, cy: c.motionCy, rx: c.motionRx, ry: c.motionRy }]
  );

  /** A little above its fill, so its outline draws over it */
  const LINE_LIFT = 0.3;

  createMerged({
    items: () => {
      const turn = ((props.rotate ?? 0) * Math.PI) / 180;
      const [cos, sin] = [Math.cos(turn), Math.sin(turn)];
      return ellipses.flatMap((e) => {
        if (![e.cx, e.cy, e.rx, e.ry].every(Number.isFinite) || e.rx <= 0 || e.ry <= 0) return [];
        const d = e.d === PIXEL_ROW ? undefined : e.d;
        const points = Array.from({ length: SEGMENTS }, (_, k) => {
          const angle = (k / SEGMENTS) * Math.PI * 2;
          const dx = e.rx * Math.cos(angle);
          const dy = e.ry * Math.sin(angle);
          // Turned clockwise on the screen (`y` down), about its center, as SVG's `rotate`
          return new Vector2(e.cx + dx * cos - dy * sin, e.cy + dx * sin + dy * cos);
        });
        const fill = props.fill === 'none' || (props.fill == null && look?.fill === 'none')
          ? null
          : rowColor(
              c.chartCtx,
              props.fill ?? undefined,
              d,
              'var(--color-surface-content, currentColor)',
              look?.fill,
              look?.fillSet
            );
        const stroke =
          props.stroke === 'none' || (props.stroke == null && !look?.stroke)
            ? null
            : rowColor(c.chartCtx, props.stroke, d, 'currentColor', look?.stroke, look?.strokeSet);
        return [
          {
            d: e.d,
            // In the scene's axes: across, up off the floor, and down the plot
            geometry: fill ? new ShapeGeometry(new Shape(points), 1).rotateX(Math.PI / 2) : null,
            fill,
            stroke,
            lines: stroke
              ? [[...points, points[0]].flatMap((p) => [p.x, LINE_LIFT, p.y])]
              : undefined,
          },
        ];
      });
    },
    opacity: () => num(props.opacity, 1) * num(props.fillOpacity, 1) * (look?.opacity ?? 1),
    lineOpacity: () => num(props.opacity, 1) * num(props.strokeOpacity, 1),
    strokeWidth: () => num(props.strokeWidth, look?.strokeWidth ?? 1),
    // Picked only for its pointer handlers (the core `Ellipse` shows no tooltip of its own)
    tooltip: () => false,
    events: () => {
      const call =
        <E extends Event>(handler: ((e: any) => void) | null | undefined) =>
        (e: E) =>
          handler?.(e);
      return {
        onclick: props.onclick && call(props.onclick),
        onpointerenter: props.onpointerenter && call(props.onpointerenter),
        onpointermove: props.onpointermove && call(props.onpointermove),
        onpointerleave: props.onpointerleave && call(props.onpointerleave),
      };
    },
  });
</script>
