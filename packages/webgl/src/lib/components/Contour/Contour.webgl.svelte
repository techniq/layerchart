<script lang="ts" module>
  import type { ContourProps } from './Contour.shared.svelte.js';
</script>

<script lang="ts">
  import { getChartContext } from 'layerchart';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { contourSegments } from '../../utils/contours.js';
  import { gridExtent, sampleGrid } from '../../utils/grid.js';
  import { createSegments } from '../../utils/lines.js';

  let {
    pixelSize = 4,
    thresholds = 10,
    z = 0,
    stroke = 'var(--color-surface-content, currentColor)',
    strokeWidth = 1,
    ...gridProps
  }: ContourProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** Its objects, stacked with other marks' in the order they're declared */
  const layer = scene.layer();

  const grid = $derived(sampleGrid(ctx, gridProps, pixelSize));
  const extent = $derived(grid ? gridExtent(grid.values) : null);

  ctx.registerComponent({
    name: 'Contour',
    kind: 'mark',
    markInfo: () => ({ zExtent: z === 'value' && extent ? extent : [0, 0] }),
  });

  const lines = createSegments();
  layer.add(lines.object);

  $effect(() => {
    const segments =
      grid && extent
        ? contourSegments(grid, extent, thresholds, (v) =>
            // Lifted a pixel off whatever they lie on
            z === 'value' ? Number(ctx.zScale(v)) + 1 : z + 0.5
          )
        : [];
    lines.set(segments);
    scene.invalidate();
  });

  $effect(() => {
    lines.style(scene.color(stroke), strokeWidth);
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
