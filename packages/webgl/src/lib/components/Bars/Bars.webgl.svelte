<script lang="ts" module>
  import type { BarsProps } from './Bars.shared.svelte.js';
</script>

<script lang="ts">
  import { BoxGeometry, Color, Quaternion, Vector3 } from 'three';
  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { getChartContext, isScaleBand } from 'layerchart';

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
  }: BarsProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets */
  const look = $derived(scene.style(className));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);
  /** Outlined only when asked, so bars without one cost nothing more */
  const outlined = $derived(stroke != null || !!look?.stroke);

  ctx.registerComponent({
    name: 'Bars',
    kind: 'mark',
    markInfo: () => ({
      data: dataProp,
      x,
      y,
      color: typeof fill === 'string' ? fill : undefined,
      stacks: z == null,
    }),
  });

  const rows = $derived((dataProp ?? ctx.data ?? []) as any[]);
  const sphere = $derived(getSphere(ctx));
  const xAccessor = $derived(resolveAccessor(x, ctx.config.x));
  const yAccessor = $derived(resolveAccessor(y, ctx.config.y));

  /** Where a bar starts along an axis and how far it reaches */
  function extent(scale: any, value: unknown): [number, number] {
    if (isScaleBand(scale)) {
      return [Number(scale(value)) + insets, Math.max(0, scale.bandwidth() - insets * 2)];
    }
    return [Number(scale(value)) - sizeProp / 2, sizeProp];
  }

  const highlight = new Color(0xffffff);

  /** Each row's bar: its corner, size, turn (on a globe), and color */
  const bars = $derived<Instance[]>(
    rows.flatMap((d: any) => {
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
            color: rowColor(ctx, fill, d, 'var(--color-primary, currentColor)', look?.fill),
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
          color: rowColor(ctx, fill, d, 'var(--color-primary, currentColor)', look?.fill),
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
    stroke: (d) => rowColor(ctx, stroke, d, 'currentColor', look?.stroke),
    strokeWidth: () => strokeWidth,
    opacity: () => opacity * (look?.opacity ?? 1),
  });
</script>
