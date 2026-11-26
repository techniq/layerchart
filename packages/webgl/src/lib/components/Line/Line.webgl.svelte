<script lang="ts" module>
  import type { LineProps } from './Line.shared.svelte.js';
</script>

<!-- A straight line between two points, as the core `Line` -->
<script lang="ts">
  import { getChartContext, isDataProp } from 'layerchart';
  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { markRows, positionOf, rowColor } from '../../utils/marks.js';
  import { createMerged } from '../../utils/merged.svelte.js';

  let {
    data,
    x1,
    y1,
    x2,
    y2,
    z1,
    z2,
    stroke,
    strokeWidth: strokeWidthProp,
    opacity = 1,
    class: className,
    style,
  }: LineProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets */
  const look = $derived(scene.style(className, style ? { style } : undefined));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);
  /** With rows (`data`, or ends reading the chart's), as the core `Line` */
  const dataMode = $derived(data != null || [x1, y1, x2, y2].some((p) => isDataProp(p)));

  /** A pixel above the floor, so it draws over what lies there (ex. a box it marks) */
  const LIFT = 0.3;

  createMerged({
    items: () =>
      (dataMode ? markRows(ctx, data, x1, y1, x2, y2) : [undefined]).map((d) => {
        const [ax, ay] = positionOf(ctx, x1, y1, d);
        const [bx, by] = positionOf(ctx, x2, y2, d);
        const az = z1 == null ? 0 : ctx.heightOf(d, z1)[1];
        const bz = z2 == null ? 0 : ctx.heightOf(d, z2)[1];
        return {
          d,
          geometry: null,
          fill: null,
          lines: [[ax, az + LIFT, ay, bx, bz + LIFT, by]],
          stroke: rowColor(
            ctx,
            stroke,
            d,
            'var(--color-surface-content, currentColor)',
            look?.stroke,
            look?.strokeSet
          ),
        };
      }),
    opacity: () => 1,
    lineOpacity: () => opacity * (look?.opacity ?? 1),
    strokeWidth: () => strokeWidth,
  });
</script>
