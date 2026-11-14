<script lang="ts" module>
  import type { ColorProp, DataProp } from 'layerchart';
  import type { MotionOptions } from 'layerchart/utils/motion.svelte';

  /** How the track behind an arc is drawn */
  export type ArcTrackProps = {
    /** CSS classes to style it by, as LayerChart's (ex. `fill-red-500/10`) */
    class?: string;
    /** @default 'color-mix(in oklab, var(--color-surface-content) 10%, transparent)' */
    fill?: string;
    /** The outline's CSS color.  No outline without one. */
    stroke?: string;
    /** @default 1 */
    opacity?: number;
  };

  export type ArcProps = {
    /** The value the arc runs to, through `domain` into `range` (as a gauge) */
    value?: number;
    /** The value to ease from with `motion`. @default 0 */
    initialValue?: number;
    /** Domain [min,max] of `value`. @default [0, 100] */
    domain?: [number, number];
    /** Range [min,max] in degrees. See also startAngle/endAngle. @default [0, 360] */
    range?: [number, number];
    /**
     * Start angle in radians, clockwise from the top of the plot (its far edge before the view
     * turns)
     */
    startAngle?: number;
    /** End angle in radians */
    endAngle?: number;
    /**
     * Define innerRadius. Defaults to yRange min
     *   • value >= 1: discrete value
     *   • value < 1: percent of `outerRadius`
     *   • value < 0: offset of `outerRadius`
     */
    innerRadius?: number;
    /**
     * Define outerRadius. Defaults to smallest width (xRange) or height (yRange) dimension (/2)
     */
    outerRadius?: number;
    /** @default 0 */
    cornerRadius?: number;
    /** @default 0 */
    padAngle?: number;
    /** Pixels to move it out from the center, along its middle angle (ex. to pull a slice out) */
    offset?: number;
    /**
     * Draw the whole range behind the arc (as a gauge's track): `true` for the default look, or
     * how to draw it
     */
    track?: boolean | ArcTrackProps;
    trackStartAngle?: number;
    trackEndAngle?: number;
    trackInnerRadius?: number;
    trackOuterRadius?: number;
    /** @default cornerRadius */
    trackCornerRadius?: number;
    /** @default padAngle */
    trackPadAngle?: number;
    /** The center across, in pixels.  Defaults to the plot's center. */
    x?: number;
    /** The center down, in pixels.  Defaults to the plot's center. */
    y?: number;
    /**
     * How tall it stands, as LayerChart's `Arc` on an `isometric` chart: pixels, or a
     * `[start, end]` pair of pixels to float it between (or a key / function of `data` through
     * the chart's `z` scale).  Flat on the floor without one.
     */
    z?: DataProp | [start: number, end: number];
    /** The row it shows in the tooltip, and its `fill` / `stroke` read */
    data?: any;
    /**
     * A CSS color, or a key / function of `data` run through the chart's color scale.
     *
     * @default 'var(--color-primary)'
     */
    fill?: ColorProp;
    /** The outline: a CSS color, or a key / function of `data` run through the color scale */
    stroke?: ColorProp;
    /** @default 1 */
    strokeWidth?: number;
    /**
     * CSS classes to style it by, as LayerChart's marks take them (ex. `fill-red-500 opacity-50`):
     * the fill, stroke, stroke width, and opacity they set, where its props don't say
     */
    class?: string;
    /** @default 1 */
    opacity?: number;
    /** Ease `value` changes */
    motion?: MotionOptions;
    /**
     * Show the tooltip for `data` when the pointer is over it (with the chart's
     * `tooltipContext`).
     *
     * @default false
     */
    tooltip?: boolean;
  };
</script>

<script lang="ts">
  import { arc as d3Arc } from 'd3-shape';
  import { scaleLinear } from 'd3-scale';
  import { getChartContext } from 'layerchart';
  import { createMotion } from 'layerchart/utils/motion.svelte';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { createMerged, type MergedItem } from '../../utils/merged.svelte.js';
  import { rowColor } from '../../utils/marks.js';
  import { extrude, ShapeContext } from '../../utils/shapes.js';

  let {
    value,
    initialValue = 0,
    domain = [0, 100],
    range = [0, 360],
    startAngle,
    endAngle,
    innerRadius,
    outerRadius,
    cornerRadius = 0,
    padAngle = 0,
    offset = 0,
    track = false,
    trackStartAngle,
    trackEndAngle,
    trackInnerRadius,
    trackOuterRadius,
    trackCornerRadius,
    trackPadAngle,
    x,
    y,
    z,
    data,
    fill,
    stroke,
    strokeWidth: strokeWidthProp,
    class: className,
    opacity = 1,
    motion,
    tooltip = false,
  }: ArcProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets, where its props don't say */
  const look = $derived(scene.style(className));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);

  // svelte-ignore state_referenced_locally
  const eased = createMotion(initialValue, () => value ?? 0, motion);

  const radians = (degrees: number) => (degrees * Math.PI) / 180;

  /** Radii as LayerChart's `Arc` reads them: pixels, a fraction of the chart's, or an offset */
  const chartRadius = $derived(Math.min(ctx.width, ctx.height) / 2);
  function outerOf(r: number | undefined) {
    if (!r) return chartRadius;
    if (r > 1) return r;
    return r > 0 ? chartRadius * r : chartRadius + r;
  }
  function innerOf(r: number | undefined, outer: number) {
    if (r == null) return Math.min(...(ctx.yRange as number[]));
    if (r > 1) return r;
    if (r > 0) return outer * r;
    return r < 0 ? outer + r : r;
  }

  const outer = $derived(outerOf(outerRadius));
  const start = $derived(startAngle ?? radians(range[0]));
  const end = $derived(
    endAngle ?? radians(scaleLinear().domain(domain).range(range)(eased.current))
  );
  const trackOuter = $derived(trackOuterRadius ? outerOf(trackOuterRadius) : outer);

  /** One arc's shape, around the plot's center (or `x` / `y`), moved out by `offset` */
  function item(
    shape: {
      startAngle: number;
      endAngle: number;
      innerRadius: number;
      outerRadius: number;
      cornerRadius: number;
      padAngle: number;
    },
    colors: { fill: string | null; stroke: string | null }
  ): MergedItem {
    const middle = (start + (endAngle ?? radians(range[1]))) / 2;
    const cx = (x ?? ctx.width / 2) + Math.sin(middle) * offset;
    const cy = (y ?? ctx.height / 2) - Math.cos(middle) * offset;
    const context = new ShapeContext();
    // `d3.arc` measures clockwise from 12 o'clock, around `(0, 0)`
    d3Arc<any>()
      .startAngle(shape.startAngle)
      .endAngle(shape.endAngle)
      .innerRadius(shape.innerRadius)
      .outerRadius(shape.outerRadius)
      .cornerRadius(shape.cornerRadius)
      .padAngle(shape.padAngle)
      .context({
        moveTo: (px: number, py: number) => context.moveTo(cx + px, cy + py),
        lineTo: (px: number, py: number) => context.lineTo(cx + px, cy + py),
        arc: (px: number, py: number, r: number, a0: number, a1: number, ccw?: boolean) =>
          context.arc(cx + px, cy + py, r, a0, a1, ccw),
        closePath: () => context.closePath(),
      } as any)(undefined);
    const pair = z == null ? [0, 0] : ctx.heightOf(data, z);
    const [base, top] = [Math.min(...pair), Math.max(...pair)];
    // Lying flat, just above the floor (and its grid)
    const [z0, z1] = top - base > 0.01 ? [base, top] : [base + 0.3, base + 0.3];
    return {
      d: data,
      geometry: colors.fill ? extrude(context, z0, z1, 24) : null,
      fill: colors.fill,
      lines: context.lines.map((line) => line.flatMap(([px, py]) => [px, z1 + 0.5, py])),
      stroke: colors.stroke,
    };
  }

  createMerged({
    tooltip: () => tooltip,
    items: () => [
      item(
        {
          startAngle: start,
          endAngle: end,
          innerRadius: innerOf(innerRadius, outer),
          outerRadius: outer,
          cornerRadius,
          padAngle,
        },
        {
          fill:
            (fill ?? look?.fill) === 'none'
              ? null
              : rowColor(ctx, fill, data, 'var(--color-primary, currentColor)', look?.fill),
          stroke:
            stroke == null && !look?.stroke
              ? null
              : rowColor(ctx, stroke, data, 'currentColor', look?.stroke),
        }
      ),
    ],
    opacity: () => opacity * (look?.opacity ?? 1),
    strokeWidth: () => strokeWidth,
  });

  // The track, a mesh of its own (for its own opacity), losing to the arc where they meet
  const trackLook = $derived(track ? (track === true ? {} : track) : null);
  const trackClassed = $derived(scene.style(trackLook?.class));
  createMerged({
    behind: true,
    items: () =>
      trackLook
        ? [
            item(
              {
                startAngle: trackStartAngle ?? startAngle ?? radians(range[0]),
                endAngle: trackEndAngle ?? endAngle ?? radians(range[1]),
                innerRadius: trackInnerRadius
                  ? innerOf(trackInnerRadius, trackOuter)
                  : innerOf(innerRadius, outer),
                outerRadius: trackOuter,
                cornerRadius: trackCornerRadius ?? cornerRadius,
                padAngle: trackPadAngle ?? padAngle,
              },
              {
                fill:
                  trackLook.fill ??
                  trackClassed?.fill ??
                  'color-mix(in oklab, var(--color-surface-content) 10%, transparent)',
                stroke: trackLook.stroke ?? trackClassed?.stroke ?? null,
              }
            ),
          ]
        : [],
    opacity: () => (trackLook?.opacity ?? 1) * (trackClassed?.opacity ?? 1),
    strokeWidth: () => strokeWidth,
  });
</script>
