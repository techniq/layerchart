<script lang="ts" module>
  import type { Accessor } from 'layerchart';
  import type { RuleProps } from './Rule.shared.svelte.js';
</script>

<script lang="ts">
  import { extent } from 'd3-array';
  import { accessor, getChartContext, isScaleBand, isScaleNumeric } from 'layerchart';
  import { getMarkData } from 'layerchart/base';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { createMerged } from '../../utils/merged.svelte.js';

  let {
    data,
    x = false,
    xOffset = 0,
    y = false,
    yOffset = 0,
    seriesKey,
    z = 0,
    stroke,
    strokeWidth: strokeWidthProp,
    opacity = 1,
    class: className,
  }: RuleProps = $props();

  const ctx = getChartContext();
  /** Its rows: its own `data`, else the chart's, narrowed to the facet panel it's drawn in */
  const markData = getMarkData();
  const scene = getSceneContext();
  /** What its `class` sets, where its props don't say */
  const look = $derived(scene.style(className));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);

  ctx.registerComponent({ name: 'Rule', kind: 'composite-mark' });

  /**
   * The series it follows (as the core `Rule`'s `Group`), looked up only with a `seriesKey`, so
   * rules without one don't read the series state
   */
  const series = $derived(
    seriesKey == null ? undefined : ctx.series.series.find((s) => s.key === seriesKey)
  );
  /** Not drawn while the legend hides its series */
  const hidden = $derived(series != null && !ctx.series.isVisible(series.key));
  /** Faded while another series is highlighted, as that series' marks are */
  const seriesOpacity = $derived(
    series == null ||
      ctx.series.visibleSeries.length <= 1 ||
      ctx.series.isHighlighted(series.key, true)
      ? 1
      : 0.1
  );

  /** A single line across or down the plot, rather than one per row */
  function single(value: unknown, scale: any, domain: unknown[], ends: string[]) {
    return (
      typeof value === 'number' ||
      value instanceof Date ||
      value === true ||
      ends.includes(value as string) ||
      (isScaleBand(scale) && domain.includes(value))
    );
  }

  /** Where each line runs, in pixels, as the core `Rule` places them */
  const lines = $derived.by(() => {
    const [xMin, xMax] = extent<number>(ctx.xRange as number[]) as [number, number];
    const [yMin, yMax] = extent<number>(ctx.yRange as number[]) as [number, number];
    const singleX = single(x, ctx.xScale, ctx.xDomain, ['$left', '$right']);
    const singleY = single(y, ctx.yScale, ctx.yDomain, ['$top', '$bottom']);
    const fallback = stroke ?? look?.stroke ?? 'var(--color-surface-content, currentColor)';
    const result: { x1: number; y1: number; x2: number; y2: number; stroke: string }[] = [];

    if (singleX) {
      const px =
        x === true || x === '$left'
          ? xMin
          : x === '$right'
            ? xMax
            : Number(ctx.xScale(x as any)) + xOffset;
      result.push({ x1: px, y1: yMin, x2: px, y2: yMax, stroke: fallback });
    }
    if (singleY) {
      const py =
        y === true || y === '$bottom'
          ? yMax
          : y === '$top'
            ? yMin
            : Number(ctx.yScale(y as any)) + yOffset;
      result.push({ x1: xMin, y1: py, x2: xMax, y2: py, stroke: fallback });
    }
    if (!singleX && !singleY) {
      const xGet = x !== false ? accessor(x as Accessor) : ctx.x;
      const yGet = y !== false ? accessor(y as Accessor) : ctx.y;
      const xBand = isScaleBand(ctx.xScale) ? ctx.xScale.bandwidth() / 2 : 0;
      const yBand = isScaleBand(ctx.yScale) ? ctx.yScale.bandwidth() / 2 : 0;
      // A row's line runs between its two values, or from zero (on a numeric scale) to its one
      const ends = (value: any, scale: any) =>
        Array.isArray(value) ? value : [isScaleNumeric(scale) ? 0 : value, value];
      for (const d of markData(data) as any[]) {
        const [x1, x2] = ends(xGet(d), ctx.xScale);
        const [y1, y2] = ends(yGet(d), ctx.yScale);
        result.push({
          x1: Number(ctx.xScale(x1)) + xBand + xOffset,
          y1: Number(ctx.yScale(y1)) + yBand + yOffset,
          x2: Number(ctx.xScale(x2)) + xBand + xOffset,
          y2: Number(ctx.yScale(y2)) + yBand + yOffset,
          stroke:
            stroke == null && !look?.stroke && ctx.config.c != null
              ? String(ctx.cGet(d))
              : fallback,
        });
      }
    }

    // Lines out of the plot (ex. a zoomed domain) aren't drawn
    return result.filter(
      (line) =>
        Math.min(line.x1, line.x2) >= xMin - 0.5 &&
        Math.max(line.x1, line.x2) <= xMax + 0.5 &&
        Math.min(line.y1, line.y2) >= yMin - 0.5 &&
        Math.max(line.y1, line.y2) <= yMax + 0.5
    );
  });

  createMerged({
    items: () =>
      (hidden ? [] : lines).map((line) => ({
        d: undefined,
        geometry: null,
        fill: null,
        lines: [[line.x1, z + 0.5, line.y1, line.x2, z + 0.5, line.y2]],
        stroke: line.stroke,
      })),
    opacity: () => opacity * seriesOpacity * (look?.opacity ?? 1),
    lineOpacity: () => opacity * seriesOpacity * (look?.opacity ?? 1),
    strokeWidth: () => strokeWidth,
  });
</script>
