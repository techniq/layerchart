<script lang="ts" module>
  import type { GridDataProps } from '../../utils/grid.js';

  export type ContourProps = GridDataProps & {
    /**
     * Pixels between samples of a function, scattered rows, or a grid on a map.
     *
     * @default 4
     */
    pixelSize?: number;
    /**
     * A count of evenly spaced thresholds, or the values.
     *
     * @default 10
     */
    thresholds?: number | number[];
    /**
     * Height off the floor: `'value'` raises each line to its threshold's height (through the
     * chart's `z` scale), and a number of pixels lays them all flat at that height.
     *
     * @default 0
     */
    z?: 'value' | number;
    /**
     * The lines' CSS color.
     *
     * @default 'var(--color-surface-content)'
     */
    stroke?: string;
  };
</script>

<script lang="ts">
  import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial, LineSegments } from 'three';
  import { getChartContext } from 'layerchart';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { contourSegments } from '../../utils/contours.js';
  import { gridExtent, sampleGrid } from '../../utils/grid.js';

  let {
    pixelSize = 4,
    thresholds = 10,
    z = 0,
    stroke = 'var(--color-surface-content, currentColor)',
    ...gridProps
  }: ContourProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();

  const grid = $derived(sampleGrid(ctx, gridProps, pixelSize));
  const extent = $derived(grid ? gridExtent(grid.values) : null);

  ctx.registerComponent({
    name: 'Contour',
    kind: 'mark',
    markInfo: () => ({ zExtent: z === 'value' && extent ? extent : [0, 0] }),
  });

  const material = new LineBasicMaterial({ transparent: true });
  const lines = new LineSegments(new BufferGeometry(), material);
  scene.root.add(lines);

  $effect(() => {
    const segments =
      grid && extent
        ? contourSegments(grid, extent, thresholds, (v) =>
            // Lifted a pixel off whatever they lie on
            z === 'value' ? Number(ctx.zScale(v)) + 1 : z + 0.5
          )
        : [];
    lines.geometry.dispose();
    lines.geometry = new BufferGeometry();
    lines.geometry.setAttribute('position', new Float32BufferAttribute(segments, 3));
    scene.invalidate();
  });

  $effect(() => {
    const color = scene.color(stroke);
    if (color) {
      material.color.copy(color.color);
      material.opacity = color.opacity;
    }
    scene.invalidate();
  });

  $effect(() => {
    return () => {
      scene.root.remove(lines);
      lines.geometry.dispose();
      material.dispose();
      scene.invalidate();
    };
  });
</script>
