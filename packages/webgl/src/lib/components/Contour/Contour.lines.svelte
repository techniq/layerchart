<script lang="ts" module>
  import type { ContourProps } from './Contour.shared.svelte.js';
</script>

<!-- Contour lines in a WebGL scene, flat or raised to their heights (`z="value"`) -->
<script lang="ts">
  import { blurGridIgnoringNaN, getChartContext, resolveDataProp } from 'layerchart';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { contourSegments } from '../../utils/contours.js';
  import { gridExtent, sampleGrid } from '../../utils/grid.js';
  import { createSegments } from '../../utils/lines.js';

  let {
    pixelSize = 4,
    thresholds = 10,
    z = 0,
    blur = 0,
    stroke = 'var(--color-surface-content, currentColor)',
    strokeOpacity = 1,
    strokeWidth = 1,
    opacity = 1,
    smooth = true,
    // Flat bands' alone (see `Contour.webgl.svelte`)
    fill: _fill,
    fillOpacity: _fillOpacity,
    class: _class,
    ...gridProps
  }: ContourProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** Its objects, stacked with other marks' in the order they're declared */
  const layer = scene.layer();

  const sampled = $derived(sampleGrid(ctx, gridProps, pixelSize));
  /** Blurred over `blur` cells, as the core `Contour` blurs its grid */
  const grid = $derived(
    sampled && blur > 0
      ? {
          ...sampled,
          values: blurGridIgnoringNaN(sampled.values, sampled.columns, sampled.rows, blur),
        }
      : sampled
  );
  const extent = $derived(grid ? gridExtent(grid.values) : null);
  /** Each threshold's height: through the `z` scale for a band property or function */
  const heightOf = $derived(
    typeof z === 'number'
      ? () => z + 0.5
      : // Lifted a pixel off whatever they lie on
        (value: number) => resolveDataProp(z, { value }, ctx.zScale, 0) + 1
  );

  /** The heights' extent in the `z` scale's units, for its domain */
  function zExtent([lo, hi]: [number, number]): [number, number] {
    const raw = (value: number) => (typeof z === 'function' ? Number(z({ value })) : value);
    const [a, b] = [raw(lo), raw(hi)];
    return a <= b ? [a, b] : [b, a];
  }

  ctx.registerComponent({
    name: 'Contour',
    kind: 'mark',
    markInfo: () => ({ zExtent: typeof z !== 'number' && extent ? zExtent(extent) : [0, 0] }),
  });

  const lines = createSegments();
  layer.add(lines.object);

  $effect(() => {
    const segments =
      grid && extent ? contourSegments(grid, extent, thresholds, heightOf, { smooth }) : [];
    lines.set(segments);
    scene.invalidate();
  });

  $effect(() => {
    const color = scene.color(stroke);
    lines.style(
      color && { ...color, opacity: color.opacity * strokeOpacity * opacity },
      strokeWidth
    );
    scene.invalidate();
  });

  $effect(() => {
    return () => {
      layer.remove(lines.object);
      lines.dispose();
      scene.invalidate();
    };
  });
</script>
