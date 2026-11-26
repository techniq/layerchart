<script lang="ts" module>
  import type { BarsProps } from './Bars.shared.svelte.js';
</script>

<!-- The bars of `Bars` (which registers them with the chart) and `Bar` (a row's, which doesn't) -->

<script lang="ts">
  import { BoxGeometry, Color, Quaternion, Vector3 } from 'three';
  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { getChartContext, isScaleBand } from 'layerchart';
  import { createDimensionGetter } from 'layerchart/utils/rect.svelte';

  import { untrack } from 'svelte';
  import { getSphere } from '../../utils/globe.js';
  import { createRowMotion } from '../../utils/rowMotion.svelte.js';
  import { cornerRadii, type Rounded } from '../../utils/rounded.js';
  import BarsRounded from './Bars.rounded.svelte';
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
    motion,
    key = (_d: any, i: number) => i,
    radius = 0,
    rounded = 'all',
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

  /** Each row's bar as asked: its corner, size, turn (on a globe), and color */
  const targets = $derived<(Instance & { key: unknown })[]>(
    rows.flatMap((d: any, i: number) => bar(d).map((b) => ({ ...b, key: key(d, i) })))
  );

  // Easing to where they're asked to be, as core's bars (a `Rect` each): each by its `key`, a new
  // one up from the baseline (as core's `Bar`), each prop by its own config (ex. a stagger's
  // `delay`)
  const PROPS = ['x', 'y', 'z', 'width', 'depth', 'height'] as const;
  const motionMap = createRowMotion(
    untrack(() => motion),
    PROPS
  );
  if (motionMap) {
    $effect(() => {
      const active = new Set<unknown>();
      for (const t of targets) {
        active.add(t.key);
        const values = { x: t.x, y: t.y, z: t.z, width: t.width, depth: t.depth, height: t.height };
        untrack(() => motionMap.update(t.key, values, grown(t)));
      }
      untrack(() => motionMap.cleanup(active));
    });
  }

  /** Where a new bar grows from: its baseline, flat along the value axis (or a 3D bar's floor) */
  function grown(t: Instance) {
    if (!flat) return { height: 0 };
    return ctx.valueAxis === 'x'
      ? { x: Math.min(...ctx.xRange), width: 0 }
      : { y: Math.max(...ctx.yRange), depth: 0 };
  }

  /** Each row's bar where it is now */
  const bars = $derived<Instance[]>(
    motionMap
      ? targets.map((t) => {
          const now = motionMap.get(t.key);
          // A new one from the baseline, until its easing starts
          return { ...t, ...(now ?? grown(t)) };
        })
      : targets
  );

  /** A row's bar (none without its values) */
  function bar(d: any): Instance[] {
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
          color: rowColor(
            ctx,
            fill,
            d,
            'var(--color-surface-content, currentColor)',
            look?.fill,
            look?.fillSet
          ),
        },
      ];
    }
    const xValue = xAccessor(d);
    const yValue = yAccessor(d);
    if (!defined(xValue) || !defined(yValue)) return [];
    if (sphere) {
      // Standing out from the globe, `size` across, centered on its longitude / latitude
      const [z0, z1] = ctx.heightOf(d, z);
      const base = new Vector3(...sphere.toScene(Number(xValue), Number(yValue), Math.min(z0, z1)));
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
          color: rowColor(
            ctx,
            fill,
            d,
            'var(--color-surface-content, currentColor)',
            look?.fill,
            look?.fillSet
          ),
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
        color: rowColor(
          ctx,
          fill,
          d,
          'var(--color-surface-content, currentColor)',
          look?.fill,
          look?.fillSet
        ),
      },
    ];
  }

  // A unit cube standing on its corner at the origin, so a bar scales out from `(x, y)` up
  /** Flat with rounded corners: each a shape (as the core `Bar`'s path), not a box */
  const roundedBars = $derived(flat && radius > 0);

  /** A bar's corner radii, for its `rounded` corners (its value's end for `'edge'`), as core's */
  function corners(bar: Instance): [number, number, number, number] {
    const asked = (typeof rounded === 'function' ? rounded(bar.d) : rounded) ?? 'all';
    if (asked !== 'edge') return cornerRadii(asked, radius);
    const raw = (ctx.valueAxis === 'y' ? yAccessor : xAccessor)(bar.d);
    const value = Array.isArray(raw)
      ? raw.reduce((a: number, b: number) => (Math.abs(b) > Math.abs(a) ? b : a), 0)
      : Number(raw);
    const side: Rounded =
      ctx.valueAxis === 'y'
        ? value >= 0 && ctx.yRange[0] > ctx.yRange[1]
          ? 'top'
          : 'bottom'
        : value >= 0 && ctx.xRange[0] < ctx.xRange[1]
          ? 'right'
          : 'left';
    return cornerRadii(side as Exclude<Rounded, 'edge'>, radius);
  }

  /** A bar's outline color: black without a `stroke` (or `class`), as LayerChart's bars */
  function outlineOf(d: any) {
    // Not the chart's color scale, which would outline each bar in its own fill
    return stroke == null && !look?.stroke
      ? 'black'
      : rowColor(ctx, stroke, d, 'black', look?.stroke, look?.strokeSet);
  }

  createInstances({
    tooltip: () => tooltip,
    geometry: new BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5),
    instances: () => (roundedBars ? [] : bars),
    opacity: () => opacity * (look?.opacity ?? 1),
    emphasize: (color) => color.lerp(highlight, 0.25),
    // Giving way to its outline in depth, so the outline sits on its edges
    behind: () => outlined,
  });

  // Around each bar's top and up its corners, as the core isometric bars are outlined
  createOutlines({
    instances: () => (outlined && !roundedBars ? bars : []),
    stroke: outlineOf,
    strokeWidth: () => strokeWidth,
    opacity: () => opacity * (look?.opacity ?? 1),
  });
</script>

{#if roundedBars}
  <BarsRounded
    {bars}
    {corners}
    height={FLAT_HEIGHT}
    stroke={(d) => (outlined ? outlineOf(d) : null)}
    {strokeWidth}
    opacity={opacity * (look?.opacity ?? 1)}
    {tooltip}
  />
{/if}
