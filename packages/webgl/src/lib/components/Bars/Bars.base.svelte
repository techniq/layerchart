<script lang="ts" module>
  import type { BarsProps } from './Bars.shared.svelte.js';
</script>

<!-- The bars of `Bars` (which registers them with the chart) and `Bar` (a row's, which doesn't) -->

<script lang="ts">
  import { BoxGeometry, Color, Quaternion, Vector3 } from 'three';
  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { getChartContext, isScaleBand } from 'layerchart';
  import { createDimensionGetter } from 'layerchart/utils/rect.svelte';

  import { getSphere } from '../../utils/globe.js';
  import { createInstances, type Instance } from '../../utils/instances.svelte.js';
  import { createOutlines } from '../../utils/outlines.js';
  import { defined, resolveAccessor, rowColor } from '../../utils/marks.js';

  let {
    data: dataProp,
    x,
    y,
    z,
    fill,
    stroke,
    strokeWidth: strokeWidthProp,
    class: className,
    opacity = 1,
    insets = 0,
    size: sizeProp = 10,
    tooltip = false,
  }: Omit<BarsProps, 'children'> = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets */
  const look = $derived(scene.style(className));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);
  /**
   * Outlined only when asked (a `stroke`, or a `strokeWidth` as LayerChart's bars take it, black
   * by default), so bars without one cost nothing more
   */
  const outlined = $derived(stroke != null || !!look?.stroke || (strokeWidthProp ?? 0) > 0);

  const rows = $derived((dataProp ?? ctx.data ?? []) as any[]);
  const sphere = $derived(getSphere(ctx));
  const xAccessor = $derived(resolveAccessor(x, ctx.config.x));
  const yAccessor = $derived(resolveAccessor(y, ctx.config.y));
  /** A 3D bar's insets, the same on every side */
  const inset = $derived(typeof insets === 'number' ? insets : (insets.all ?? 0));

  /**
   * Without a height (`z`, here or the chart's), LayerChart's 2D bars, flat on the floor: across
   * the band scale's bands, and along the value axis from its baseline (or between a stack's
   * values)
   */
  const flat = $derived(!sphere && z == null && ctx.config.z == null);
  const stack = $derived(ctx.stackAccessorsFor({ stacksImplicitly: true }));
  const dimensions = createDimensionGetter(ctx, () => ({
    x: x ?? (ctx.valueAxis === 'x' ? stack?.value : undefined),
    y: y ?? (ctx.valueAxis === 'y' ? stack?.value : undefined),
    insets: typeof insets === 'number' ? { all: insets } : insets,
  }));

  /** Where a bar starts along an axis and how far it reaches */
  function extent(scale: any, value: unknown): [number, number] {
    if (isScaleBand(scale)) {
      return [Number(scale(value)) + inset, Math.max(0, scale.bandwidth() - inset * 2)];
    }
    return [Number(scale(value)) - sizeProp / 2, sizeProp];
  }

  const highlight = new Color(0xffffff);
  /** A flat bar's thickness: enough for its outline to sit on its top */
  const FLAT_HEIGHT = 0.01;

  /** Each row's bar: its corner, size, turn (on a globe), and color */
  const bars = $derived<Instance[]>(
    rows.flatMap((d: any) => {
      if (flat) {
        const rect = dimensions(d);
        if (!rect || !(rect.width > 0) || !(rect.height > 0)) return [];
        return [
          {
            d,
            x: rect.x,
            y: rect.y,
            z: 0,
            width: rect.width,
            depth: rect.height,
            height: FLAT_HEIGHT,
            color: rowColor(ctx, fill, d, 'var(--color-surface-content, currentColor)', look?.fill),
          },
        ];
      }
      const xValue = xAccessor(d);
      const yValue = yAccessor(d);
      if (!defined(xValue) || !defined(yValue)) return [];
      if (sphere) {
        // Standing out from the globe, `size` across, centered on its longitude / latitude
        const [z0, z1] = ctx.heightOf(d, z);
        const base = new Vector3(
          ...sphere.toScene(Number(xValue), Number(yValue), Math.min(z0, z1))
        );
        const outward = base
          .clone()
          .sub(new Vector3(...sphere.center))
          .normalize();
        const rotation = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), outward);
        // The box's corner, half its footprint back from the center
        const corner = new Vector3(-sizeProp / 2, 0, -sizeProp / 2)
          .applyQuaternion(rotation)
          .add(base);
        return [
          {
            d,
            x: corner.x,
            y: corner.z,
            z: corner.y,
            width: sizeProp,
            depth: sizeProp,
            height: Math.abs(z1 - z0),
            rotation,
            color: rowColor(ctx, fill, d, 'var(--color-surface-content, currentColor)', look?.fill),
          },
        ];
      }
      const [x0, width] = extent(ctx.xScale, xValue);
      const [y0, depth] = extent(ctx.yScale, yValue);
      const [z0, z1] = ctx.heightOf(d, z);
      return [
        {
          d,
          x: x0,
          y: y0,
          z: Math.min(z0, z1),
          width,
          depth,
          height: Math.abs(z1 - z0),
          color: rowColor(ctx, fill, d, 'var(--color-surface-content, currentColor)', look?.fill),
        },
      ];
    })
  );

  // A unit cube standing on its corner at the origin, so a bar scales out from `(x, y)` up
  createInstances({
    tooltip: () => tooltip,
    geometry: new BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5),
    instances: () => bars,
    opacity: () => opacity * (look?.opacity ?? 1),
    emphasize: (color) => color.lerp(highlight, 0.25),
    // Giving way to its outline in depth, so the outline sits on its edges
    behind: () => outlined,
  });

  // Around each bar's top and up its corners, as the core isometric bars are outlined
  createOutlines({
    instances: () => (outlined ? bars : []),
    // Black without a `stroke` (or `class`), as LayerChart's bars: not the chart's color scale,
    // which would outline each bar in its own fill
    stroke: (d) =>
      stroke == null && !look?.stroke ? 'black' : rowColor(ctx, stroke, d, 'black', look?.stroke),
    strokeWidth: () => strokeWidth,
    opacity: () => opacity * (look?.opacity ?? 1),
  });
</script>
