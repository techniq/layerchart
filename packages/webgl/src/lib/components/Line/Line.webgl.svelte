<script lang="ts" module>
  import type { LineProps } from './Line.shared.svelte.js';
</script>

<!-- A straight line between two points, as the core `Line` -->
<script lang="ts">
  import { untrack } from 'svelte';
  import { getChartContext, isDataProp } from 'layerchart';
  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { markRows, positionOf, rowColor } from '../../utils/marks.js';
  import { createMerged } from '../../utils/merged.svelte.js';
  import { createRowMotion } from '../../utils/rowMotion.svelte.js';
  import LineMarkers from './Line.markers.svelte';

  let {
    x1,
    initialX1,
    y1,
    initialY1,
    x2,
    initialX2,
    y2,
    z1,
    z2,
    initialY2,
    data,
    key = (_, i) => i,
    marker,
    markerStart,
    markerMid,
    markerEnd,
    motion,
    dashArray,
    stroke,
    strokeOpacity = 1,
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

  /** Each row's line where it's asked to be, by its `key` */
  const targets = $derived(
    (dataMode ? markRows(ctx, data, x1, y1, x2, y2) : [undefined]).map((d, i) => {
      const [ax, ay] = positionOf(ctx, x1, y1, d);
      const [bx, by] = positionOf(ctx, x2, y2, d);
      return {
        d,
        key: dataMode ? key(d, i) : 0,
        x1: ax,
        y1: ay,
        x2: bx,
        y2: by,
        z1: z1 == null ? 0 : ctx.heightOf(d, z1)[1],
        z2: z2 == null ? 0 : ctx.heightOf(d, z2)[1],
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

  /** Where a line placed by pixels starts, as the core `Line`'s `initialX1` ... (else where it is) */
  const initial = $derived(
    dataMode
      ? undefined
      : Object.fromEntries(
          Object.entries({ x1: initialX1, y1: initialY1, x2: initialX2, y2: initialY2 }).filter(
            ([, value]) => value != null
          )
        )
  );

  // Easing each end to where it's asked to be, as the core `Line`: a row at a time by its `key`,
  // and a line placed by pixels from its `initial` ends
  const PROPS = ['x1', 'y1', 'x2', 'y2', 'z1', 'z2'] as const;
  const motionMap = createRowMotion(
    untrack(() => motion),
    PROPS
  );
  if (motionMap) {
    $effect(() => {
      const active = new Set<unknown>();
      for (const t of targets) {
        active.add(t.key);
        untrack(() => motionMap.update(t.key, t, initial));
      }
      untrack(() => motionMap.cleanup(active));
    });
  }

  /** Each line where it is now */
  const lines = $derived(
    motionMap ? targets.map((t) => ({ ...t, ...(motionMap.get(t.key) ?? initial) })) : targets
  );

  createMerged({
    items: () =>
      lines.map((t) => ({
        d: t.d,
        geometry: null,
        fill: null,
        lines: [[t.x1, t.z1 + LIFT, t.y1, t.x2, t.z2 + LIFT, t.y2]],
        stroke: t.stroke,
      })),
    opacity: () => 1,
    lineOpacity: () => opacity * strokeOpacity * (look?.opacity ?? 1),
    strokeWidth: () => strokeWidth,
    dash: () => dashArray,
  });
</script>

{#if marker || markerStart || markerMid || markerEnd}
  <LineMarkers
    {marker}
    {markerStart}
    {markerMid}
    {markerEnd}
    lines={() =>
      lines.map((t) => ({
        points: [t.x1, t.z1 + LIFT, t.y1, t.x2, t.z2 + LIFT, t.y2],
        color: t.stroke,
      }))}
    {strokeWidth}
    opacity={opacity * (look?.opacity ?? 1)}
  />
{/if}
