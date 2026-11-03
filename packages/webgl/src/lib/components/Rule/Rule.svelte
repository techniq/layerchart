<script lang="ts" module>
  import type { Accessor } from 'layerchart';

  export type RuleProps = {
    /** Override the data from the context */
    data?: any[];
    /**
     * Create a vertical `x` line
     * - If true or '$left', will draw at chart left (xRange[0])
     * - If '$right', will draw at chart right (xRange[1])
     * - Use number | Date value for annotation (xScale(value))
     * - Use an accessor for a line per row
     *
     * @default false
     */
    x?: number | Date | boolean | '$left' | '$right' | Accessor;
    /** Pixel offset to apply to `x` coordinate. @default 0 */
    xOffset?: number;
    /**
     * Create a horizontal `y` line
     * - If true or '$bottom', will draw at chart bottom (yRange[0])
     * - If '$top', will draw at chart top (yRange[1])
     * - Use number | Date value for annotation (yScale(value))
     * - Use an accessor for a line per row
     *
     * @default false
     */
    y?: number | Date | boolean | '$top' | '$bottom' | Accessor;
    /** Pixel offset to apply to `y` coordinate. @default 0 */
    yOffset?: number;
    /** Pixels up off the floor to draw at. @default 0 */
    z?: number;
    /**
     * The line's CSS color.  Rows' lines take the chart's color scale (`c`) without one.
     *
     * @default 'var(--color-surface-content)'
     */
    stroke?: string;
    /**
     * Width in pixels, the same at any depth.
     *
     * @default 1
     */
    strokeWidth?: number;
    /** @default 1 */
    opacity?: number;
    /**
     * CSS classes to style it by, as LayerChart's marks take them (ex. `stroke-red-500`): the
     * stroke, stroke width, and opacity they set, where its props don't say
     */
    class?: string;
  };
</script>

<script lang="ts">
  import { extent } from 'd3-array';
  import { accessor, getChartContext, isScaleBand, isScaleNumeric } from 'layerchart';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { createMerged } from '../../utils/merged.svelte.js';

  let {
    data,
    x = false,
    xOffset = 0,
    y = false,
    yOffset = 0,
    z = 0,
    stroke,
    strokeWidth: strokeWidthProp,
    opacity = 1,
    class: className,
  }: RuleProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets, where its props don't say */
  const look = $derived(scene.style(className));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);

  ctx.registerComponent({ name: 'Rule', kind: 'composite-mark' });

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

  /** Where each line runs, in pixels, as LayerChart's `Rule` places them */
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
      for (const d of data ?? ((ctx.data ?? []) as any[])) {
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
      lines.map((line) => ({
        d: undefined,
        geometry: null,
        fill: null,
        lines: [[line.x1, z + 0.5, line.y1, line.x2, z + 0.5, line.y2]],
        stroke: line.stroke,
      })),
    opacity: () => opacity * (look?.opacity ?? 1),
    strokeWidth: () => strokeWidth,
  });
</script>
