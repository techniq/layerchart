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

  let {
    pathData,
    fill,
    fillOpacity = 1,
    stroke,
    strokeWidth: strokeWidthProp,
    class: className,
    opacity = 1,
    z = 0,
    motion,
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
          lines: outlined
            ? drawn.map(({ points }) =>
                points.flatMap(([px, py]) => [px, height + 0.1 + LINE_LIFT, py])
              )
            : [],
          stroke: outlined ? strokeColor : null,
        },
      ];
    },
    opacity: () => opacity * fillOpacity * (look?.opacity ?? 1),
    lineOpacity: () => opacity * (look?.opacity ?? 1),
    strokeWidth: () => strokeWidth,
    once: true,
  });
</script>
