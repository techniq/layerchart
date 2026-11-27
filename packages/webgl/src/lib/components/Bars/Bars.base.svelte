<script lang="ts" module>
  import type { BarsProps } from './Bars.shared.svelte.js';
  import type { BarEvents } from '../Bar/Bar.shared.svelte.js';
</script>

<!-- The bars of `Bars` (which registers them with the chart) and `Bar` (a row's, which doesn't) -->

<script lang="ts">
  import { getMarkData } from 'layerchart/base';
  import { BoxGeometry, Color, Quaternion, Vector3 } from 'three';
  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { getChartContext, isScaleBand } from 'layerchart';
  import { createDimensionGetter, type Insets } from 'layerchart/utils/rect.svelte';

  import { untrack } from 'svelte';
  import { getSphere } from '../../utils/globe.js';
  import { createRowMotion } from '../../utils/rowMotion.svelte.js';
  import { cornerRadii, type Rounded } from '../../utils/rounded.js';
  import BarsRounded from './Bars.rounded.svelte';
  import { createInstances, type Instance } from '../../utils/instances.svelte.js';
  import { createOutlines } from '../../utils/outlines.js';
  import { defined, resolveAccessor, rowColor } from '../../utils/marks.js';
  import { paintOf } from '../../utils/paint.svelte.js';

  let {
    data: dataProp,
    x,
    y,
    x1,
    y1,
    z,
    seriesKey,
    stackPadding = 0,
    fill,
    fillOpacity = 1,
    stroke,
    strokeWidth: strokeWidthProp,
    strokeOpacity = 1,
    class: className,
    opacity = 1,
    insets: insetsProp,
    size: sizeProp = 10,
    width: widthProp,
    height: heightProp,
    initialX,
    initialY,
    initialWidth,
    initialHeight,
    tooltip = false,
    motion,
    key = (_d: any, i: number) => i,
    radius = 0,
    rounded = 'all',
    onBarClick,
    onclick,
    ondblclick,
    onpointerenter,
    onpointermove,
    onpointerleave,
    onpointerover,
    onpointerout,
  }: Omit<BarsProps, 'children'> & BarEvents = $props();

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

  /** Its series, as the core `Bars`: its rows, values, and color */
  const series = $derived(
    seriesKey ? ctx.series.series.find((s) => s.key === seriesKey) : undefined
  );
  /** Its rows: its own `data`, else its series' or the chart's, narrowed to its facet panel */
  const markData = getMarkData();
  const rows = $derived(markData(dataProp, series?.data) as any[]);
  const sphere = $derived(getSphere(ctx));
  const stack = $derived(ctx.stackAccessorsFor({ seriesKey, stacksImplicitly: true }));
  const seriesAccessor = $derived(ctx.series.valueAccessor(seriesKey));
  /** Its values along the value axis: its stack's, else its series', as the core `Bar` reads them */
  const xProp = $derived(
    x ?? (ctx.valueAxis === 'x' ? (stack?.value ?? seriesAccessor) : undefined)
  );
  const yProp = $derived(
    y ?? (ctx.valueAxis === 'y' ? (stack?.value ?? seriesAccessor) : undefined)
  );
  const xAccessor = $derived(resolveAccessor(xProp, ctx.config.x));
  const yAccessor = $derived(resolveAccessor(yProp, ctx.config.y));

  /**
   * `stackPadding` between a stack's bars, as the core `Bar`: half on each side of a bar, but the
   * stack's ends, along the value axis (where `insets` don't say)
   */
  const stackInsets = $derived.by((): Insets | undefined => {
    const index = seriesKey
      ? ctx.series.visibleSeries.findIndex((s) => s.key === seriesKey)
      : undefined;
    if (ctx.series.stackLayout == null || stackPadding === 0 || index === undefined) return;
    const first = index === 0;
    const last = index === ctx.series.visibleSeries.length - 1;
    const half = stackPadding / 2;
    return ctx.valueAxis === 'y'
      ? { bottom: first ? undefined : half, top: last ? undefined : half }
      : { left: first ? undefined : half, right: last ? undefined : half };
  });
  const insets = $derived(
    insetsProp == null
      ? stackInsets
      : typeof insetsProp === 'number'
        ? { all: insetsProp }
        : insetsProp
  );
  /** A 3D bar's insets, the same on every side */
  const inset = $derived(insets?.all ?? 0);

  /**
   * Without a height (`z`, here or the chart's), LayerChart's 2D bars, flat on the floor: across
   * the band scale's bands (or a sub-band's, with `x1` / `y1`), and along the value axis from its
   * baseline (or between a stack's values)
   */
  const flat = $derived(!sphere && z == null && ctx.config.z == null);
  const dimensions = createDimensionGetter(ctx, () => ({
    x: xProp,
    y: yProp,
    x1,
    y1,
    insets,
  }));

  /**
   * Where a bar starts along an axis and how far it reaches: across its band (or its `sub`
   * band, ex. a grouped bar's), else `size` about its value
   */
  function extent(
    scale: any,
    value: unknown,
    sub?: { scale: any; value: unknown } | null
  ): [number, number] {
    if (isScaleBand(scale)) {
      const start = Number(scale(value)) + (sub ? Number(sub.scale(sub.value)) || 0 : 0);
      const band = sub ? (sub.scale.bandwidth?.() ?? 0) : scale.bandwidth();
      return [start + inset, Math.max(0, band - inset * 2)];
    }
    return [Number(scale(value)) - sizeProp / 2, sizeProp];
  }

  /** A bar's sub-band along an axis, by `x1` / `y1` (here or the chart's) through its scale */
  function subBand(d: any, prop: unknown, fallback: unknown, scale: any) {
    const sub = prop ?? fallback;
    return sub != null && scale
      ? { scale, value: resolveAccessor(sub as any, undefined)(d) }
      : null;
  }

  /** A bar's `width` and `height` (down `y`) when fixed, centered where it would have been */
  function fixed<T extends { x: number; y: number; width: number; depth: number }>(bar: T): T {
    if (widthProp != null) {
      bar.x += (bar.width - widthProp) / 2;
      bar.width = widthProp;
    }
    if (heightProp != null) {
      bar.y += (bar.depth - heightProp) / 2;
      bar.depth = heightProp;
    }
    return bar;
  }

  /** A row's fill: `fill`, else its series', else the chart's `c` (or its `class`'s) */
  /** A row's own `opacity`, when it's a function of the row (ex. `BarChart`'s, fading series) */
  const rowOpacity = (d: any) => (typeof opacity === 'function' ? Number(opacity(d)) : 1);
  /** `color` faded by its row's `opacity` (a bar's color alpha, which `opacity` multiplies) */
  function fadedBy(color: string, d: any) {
    const alpha = rowOpacity(d);
    return alpha >= 1 || !Number.isFinite(alpha)
      ? color
      : `color-mix(in srgb, ${color} ${Math.max(0, alpha) * 100}%, transparent)`;
  }

  function colorOf(d: any) {
    return fadedBy(colorOf_(d), d);
  }

  function colorOf_(d: any) {
    return rowColor(
      ctx,
      fill ?? series?.color,
      d,
      'var(--color-surface-content, currentColor)',
      look?.fill,
      look?.fillSet
    );
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
        untrack(() => motionMap.update(t.key, values, initialOf(t)));
      }
      untrack(() => motionMap.cleanup(active));
    });
  }

  /**
   * Where a new bar eases in from: `initialX` / `initialY` / `initialWidth` / `initialHeight`
   * where they're given, else its baseline, flat along the value axis (or a 3D bar's floor)
   */
  function initialOf(_t: Instance) {
    const grown: Partial<Record<(typeof PROPS)[number], number>> = !flat
      ? { height: 0 }
      : ctx.valueAxis === 'x'
        ? { x: Math.min(...ctx.xRange), width: 0 }
        : { y: Math.max(...ctx.yRange), depth: 0 };
    if (initialX != null) grown.x = initialX;
    if (initialY != null) grown.y = initialY;
    if (initialWidth != null) grown.width = initialWidth;
    if (initialHeight != null) grown.depth = initialHeight;
    return grown;
  }

  /** Each row's bar where it is now */
  const bars = $derived<Instance[]>(
    motionMap
      ? targets.map((t) => {
          const now = motionMap.get(t.key);
          // A new one from the baseline, until its easing starts
          return { ...t, ...(now ?? initialOf(t)) };
        })
      : targets
  );

  /** A row's bar (none without its values) */
  function bar(d: any): Instance[] {
    if (flat) {
      const rect = dimensions(d);
      if (!rect) return [];
      const placed = fixed({
        d,
        x: rect.x,
        y: rect.y,
        z: 0,
        width: rect.width,
        depth: rect.height,
        height: FLAT_HEIGHT,
        color: colorOf(d),
      });
      return placed.width > 0 && placed.depth > 0 ? [placed] : [];
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
      const across = widthProp ?? sizeProp;
      const down = heightProp ?? sizeProp;
      const corner = new Vector3(-across / 2, 0, -down / 2).applyQuaternion(rotation).add(base);
      return [
        {
          d,
          x: corner.x,
          y: corner.z,
          z: corner.y,
          width: across,
          depth: down,
          height: Math.abs(z1 - z0),
          rotation,
          color: colorOf(d),
        },
      ];
    }
    const [x0, width] = extent(ctx.xScale, xValue, subBand(d, x1, ctx.config.x1, ctx.x1Scale));
    const [y0, depth] = extent(ctx.yScale, yValue, subBand(d, y1, ctx.config.y1, ctx.y1Scale));
    const [z0, z1] = ctx.heightOf(d, z);
    return [
      fixed({
        d,
        x: x0,
        y: y0,
        z: Math.min(z0, z1),
        width,
        depth,
        height: Math.abs(z1 - z0),
        color: colorOf(d),
      }),
    ];
  }

  // A unit cube standing on its corner at the origin, so a bar scales out from `(x, y)` up
  /**
   * Flat with rounded corners, or filled with a `LinearGradient` or `Pattern` (`url(#id)`, which
   * paint across flat shapes): each a shape (as the core `Bar`'s path), not a box
   */
  const roundedBars = $derived(flat && (radius > 0 || paintOf(scene, fill) != null));

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
    return fadedBy(
      stroke == null && !look?.stroke
        ? 'black'
        : rowColor(ctx, stroke, d, 'black', look?.stroke, look?.strokeSet),
      d
    );
  }

  /** Its pointer handlers, called with the bar's row (`onBarClick` is its `onclick`) */
  const events = () => ({
    onclick: onclick ?? onBarClick,
    ondblclick,
    onpointerenter,
    onpointermove,
    onpointerleave,
    onpointerover,
    onpointerout,
  });

  /** The whole mark's `opacity`: a number's, else each row's own (see `fadedBy`) */
  const markOpacity = $derived(typeof opacity === 'number' ? opacity : 1);
  const fillAlpha = $derived(markOpacity * fillOpacity * (look?.opacity ?? 1));
  const strokeAlpha = $derived(markOpacity * strokeOpacity * (look?.opacity ?? 1));

  createInstances({
    tooltip: () => tooltip,
    events,
    geometry: new BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5),
    instances: () => (roundedBars ? [] : bars),
    opacity: () => fillAlpha,
    emphasize: (color) => color.lerp(highlight, 0.25),
    // Giving way to its outline in depth, so the outline sits on its edges
    behind: () => outlined,
  });

  // Around each bar's top and up its corners, as the core isometric bars are outlined
  createOutlines({
    instances: () => (outlined && !roundedBars ? bars : []),
    stroke: outlineOf,
    strokeWidth: () => strokeWidth,
    opacity: () => strokeAlpha,
  });
</script>

{#if roundedBars}
  <BarsRounded
    {bars}
    {corners}
    height={FLAT_HEIGHT}
    stroke={(d) => (outlined ? outlineOf(d) : null)}
    {strokeWidth}
    opacity={fillAlpha}
    lineOpacity={strokeAlpha}
    {tooltip}
    {events}
  />
{/if}
