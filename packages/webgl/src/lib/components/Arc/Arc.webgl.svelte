<script lang="ts" module>
  import type { ArcProps } from './Arc.shared.svelte.js';
</script>

<script lang="ts">
  import { arc as d3Arc } from 'd3-shape';
  import { scaleLinear } from 'd3-scale';
  import { untrack } from 'svelte';
  import { getChartContext } from 'layerchart';
  import { ArcState } from 'layerchart/base';
  import { createMotion } from 'layerchart/utils/motion.svelte';

  import { getParent, getSceneContext } from '../../contexts/scene.svelte.js';
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
    fillOpacity = 1,
    stroke,
    strokeWidth: strokeWidthProp,
    strokeOpacity = 1,
    class: className,
    opacity = 1,
    motion,
    tooltip = false,
    children,
  }: ArcProps = $props();

  /**
   * With `children`, what the core `Arc` gives them (ex. `getArcTextProps` to place a label at its
   * centroid), from the core `Arc`'s own state
   */
  const state = untrack(() => children)
    ? new ArcState(
        () =>
          ({
            motion,
            value,
            initialValue,
            domain,
            range,
            startAngle,
            endAngle,
            innerRadius,
            outerRadius,
            cornerRadius,
            padAngle,
            trackStartAngle,
            trackEndAngle,
            trackInnerRadius,
            trackOuterRadius,
            trackCornerRadius,
            trackPadAngle,
            offset,
          }) as any
      )
    : null;

  const ctx = getChartContext();
  /**
   * Where an arc without `x` / `y` is centered: inside a `Group` (or a centered layer), its
   * origin, as the core `Arc`'s; else the plot's center
   */
  const inGroup = getParent() != null;
  const origin = $derived(inGroup ? { x: 0, y: 0 } : { x: ctx.width / 2, y: ctx.height / 2 });
  const scene = getSceneContext();
  /** What its `class` sets, where its props don't say */
  const look = $derived(scene.style(className));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);

  // svelte-ignore state_referenced_locally
  const eased = createMotion(initialValue, () => value ?? 0, motion);

  const radians = (degrees: number) => (degrees * Math.PI) / 180;

  /** Radii as the core `Arc` reads them: pixels, a fraction of the chart's, or an offset */
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
    const cx = (x ?? origin.x) + Math.sin(middle) * offset;
    const cy = (y ?? origin.y) - Math.cos(middle) * offset;
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
              : rowColor(
                  ctx,
                  fill,
                  data,
                  'var(--color-primary, currentColor)',
                  look?.fill,
                  look?.fillSet
                ),
          stroke:
            stroke == null && !look?.stroke
              ? null
              : rowColor(ctx, stroke, data, 'currentColor', look?.stroke, look?.strokeSet),
        }
      ),
    ],
    // Its fill and its outline each at their own opacity, under `opacity`, as an SVG path's
    opacity: () => opacity * fillOpacity * (look?.opacity ?? 1),
    lineOpacity: () => opacity * strokeOpacity * (look?.opacity ?? 1),
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

{#if children && state}
  {@render children({
    centroid: state.trackArcCentroid,
    boundingBox: state.boundingBox,
    value: state.motionEndAngleValue,
    startAngle: state.startAngle,
    endAngle: state.arcEndAngle,
    innerRadius: state.innerRadius,
    outerRadius: state.outerRadius,
    getTrackTextProps: state.getTrackTextProps,
    getArcTextProps: state.getArcTextProps,
  })}
{/if}
