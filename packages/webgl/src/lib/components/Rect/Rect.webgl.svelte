<script lang="ts" module>
  import type { RectProps } from './Rect.shared.svelte.js';
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { BoxGeometry, Color } from 'three';
  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { getChartContext, isDataProp, resolveDataProp } from 'layerchart';

  import { createInstances } from '../../utils/instances.svelte.js';
  import { createOutlines } from '../../utils/outlines.js';
  import { createRowMotion } from '../../utils/rowMotion.svelte.js';
  import BarsRounded from '../Bars/Bars.rounded.svelte';
  import { resolveCorners, resolveInsets } from 'layerchart/utils/rect.svelte';
  import { markRows, positionOf, rowColor } from '../../utils/marks.js';

  let {
    data,
    x,
    y,
    width,
    height,
    x0,
    x1,
    y0,
    y1,
    z,
    fill,
    stroke,
    strokeWidth: strokeWidthProp,
    class: className,
    style,
    opacity = 1,
    fillOpacity = 1,
    strokeOpacity = 1,
    tooltip = false,
    motion,
    key = (_d: any, i: number) => i,
    rx = 0,
    corners,
    initialX,
    initialY,
    initialWidth,
    initialHeight,
    shade = true,
    insets,
    dashArray,
    onclick,
    ondblclick,
    onpointerenter,
    onpointermove,
    onpointerleave,
    onpointerover,
    onpointerout,
  }: RectProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets */
  const look = $derived(scene.style(className, style ? { style } : undefined));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);
  const highlight = new Color(0xffffff);
  /** A pixel-mode box's row, so the pointer picks it (its handlers are called without one) */
  const PIXEL_ROW = {};

  /** With rows (`data`, or props reading the chart's), as the core `Rect` */
  const dataMode = $derived(
    data != null || [x, y, width, height, x0, x1, y0, y1].some((p) => isDataProp(p))
  );
  const edges = $derived(x0 != null || x1 != null || y0 != null || y1 != null);

  /** The box's footprint on the floor, in pixels, shrunk by its `insets` */
  function footprint(d: any) {
    const inset = resolveInsets(insets);
    if (edges) {
      const [x0Px, y0Px] = positionOf(ctx, x0, y0, d, { bandStart: true });
      const [x1Px, y1Px] = positionOf(ctx, x1, y1, d, { bandStart: true });
      const left = Math.min(x0Px, x1Px) + inset.left;
      const top = Math.min(y0Px, y1Px) + inset.top;
      return {
        x: left,
        y: top,
        width: Math.max(0, Math.max(x0Px, x1Px) - inset.right - left),
        depth: Math.max(0, Math.max(y0Px, y1Px) - inset.bottom - top),
      };
    }
    const [px, py] = positionOf(ctx, x, y, d, { bandStart: true });
    return {
      x: px + inset.left,
      y: py + inset.top,
      width: Math.max(0, resolveDataProp(width, d, undefined, 0) - inset.left - inset.right),
      depth: Math.max(0, resolveDataProp(height, d, undefined, 0) - inset.top - inset.bottom),
    };
  }

  /** The box's base and top heights, in pixels */
  function heights(d: any): [number, number] {
    if (z == null) return dataMode && ctx.config.z != null ? ctx.heightOf(d) : [0, 0.3];
    if (typeof z === 'function') {
      const value = z(d);
      if (Array.isArray(value)) {
        const [a, b] = value.map((v) => Number(ctx.zScale(v)) || 0);
        return [Math.min(a, b), Math.max(a, b)];
      }
    }
    const [a, b] = ctx.heightOf(d, z);
    return [Math.min(a, b), Math.max(a, b)];
  }

  /** Each row's box as asked: its corner, size, and color */
  const targets = $derived(
    (dataMode ? markRows(ctx, data, x, y, width, height, x0, x1, y0, y1) : [undefined]).map(
      (d, i) => {
        const [base, top] = heights(d);
        return {
          // In pixel mode, a row of its own for its pointer handlers to be called with
          d: dataMode ? d : PIXEL_ROW,
          key: key(d, i),
          ...footprint(d),
          z: base,
          height: top - base,
          color: rowColor(
            ctx,
            fill ?? undefined,
            d,
            'var(--color-surface-content, currentColor)',
            look?.fill,
            look?.fillSet
          ),
        };
      }
    )
  );

  /**
   * Where a new box eases in from in pixel mode, as the core `Rect`: `initialX` / `initialY` /
   * `initialWidth` / `initialHeight` where they're given (else where it's asked to be)
   */
  function initialOf(): Partial<Record<(typeof PROPS)[number], number>> | undefined {
    if (dataMode) return undefined;
    const initial: Partial<Record<(typeof PROPS)[number], number>> = {};
    if (initialX != null) initial.x = initialX;
    if (initialY != null) initial.y = initialY;
    if (initialWidth != null) initial.width = initialWidth;
    if (initialHeight != null) initial.depth = initialHeight;
    return initial;
  }

  // Easing to where they're asked to be, as the core `Rect` (ex. a highlight's band springing
  // from row to row), each by its `key`
  const PROPS = ['x', 'y', 'width', 'depth', 'z', 'height'] as const;
  const motionMap = createRowMotion(
    untrack(() => motion),
    PROPS
  );
  if (motionMap) {
    $effect(() => {
      const active = new Set<unknown>();
      for (const t of targets) {
        active.add(t.key);
        const values = { x: t.x, y: t.y, width: t.width, depth: t.depth, z: t.z, height: t.height };
        untrack(() => motionMap.update(t.key, values, initialOf()));
      }
      untrack(() => motionMap.cleanup(active));
    });
  }

  /** Each row's box where it is now (a new one where it eases in from, until its easing starts) */
  const boxes = $derived(
    motionMap ? targets.map((t) => ({ ...t, ...(motionMap.get(t.key) ?? initialOf()) })) : targets
  );

  /** Flat with rounded corners (`rx`): each a shape, as the core `Rect`'s, not a box */
  const roundedRects = $derived(
    (rx > 0 || (corners != null && resolveCorners(corners, 1e9, 1e9).some((r) => r > 0))) &&
      !ctx.view &&
      z == null &&
      !(dataMode && ctx.config.z != null)
  );
  /** A rect's corner radii: `corners` (as the core `Rect`), else `rx` at each */
  function radiiOf(box: { width: number; depth: number }): [number, number, number, number] {
    return corners != null
      ? (resolveCorners(corners, box.width, box.depth) as [number, number, number, number])
      : [rx, rx, rx, rx];
  }

  /** No box for a `none` fill (ex. `class="fill-none"`), only its outline */
  const filled = $derived(
    fill !== null && fill !== 'none' && !(fill == null && look?.fill === 'none')
  );

  /** Outlined only when asked, so boxes without one cost nothing more */
  const outlined = $derived(
    stroke != null ? stroke !== 'none' : !!look?.stroke && look.stroke !== 'none'
  );

  /** Its pointer handlers, called with the box's row (none in pixel mode) */
  const events = () => {
    const row =
      <E extends Event>(handler: ((e: E, detail: { data: any }) => void) | null | undefined) =>
      (e: E, { data }: { data: any }) =>
        handler?.(e, { data: data === PIXEL_ROW ? undefined : data });
    return {
      onclick: onclick && row(onclick),
      ondblclick: ondblclick && row(ondblclick),
      onpointerenter: onpointerenter && row(onpointerenter),
      onpointermove: onpointermove && row(onpointermove),
      onpointerleave: onpointerleave && row(onpointerleave),
      onpointerover: onpointerover && row(onpointerover),
      onpointerout: onpointerout && row(onpointerout),
    };
  };
  /** A row's outline color (a pixel-mode box has none of its own to color it by) */
  const strokeOf = (d: any) =>
    rowColor(
      ctx,
      stroke,
      d === PIXEL_ROW ? undefined : d,
      'currentColor',
      look?.stroke,
      look?.strokeSet
    );
  const fillAlpha = $derived(opacity * fillOpacity * (look?.opacity ?? 1));
  const strokeAlpha = $derived(opacity * strokeOpacity * (look?.opacity ?? 1));
  // Only for outlines dashed as it mounts, so solid ones cost nothing more
  const dash = untrack(() => dashArray) != null ? () => dashArray : undefined;

  // A unit cube standing on its corner at the origin, so each box scales out from `(x, y)` up
  createInstances({
    // Rows to show, in data mode
    tooltip: () => tooltip && dataMode,
    events,
    // Unshaded, each face its own color whatever the lights, as the core `Rect`'s `shade`
    glow: () => !shade,
    geometry: new BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5),
    instances: () => (filled && !roundedRects ? boxes : []),
    opacity: () => fillAlpha,
    emphasize: (color) => color.lerp(highlight, 0.25),
    // Giving way to its outline in depth, so the outline sits on its edges
    behind: () => outlined,
  });

  // Around each box's top and up its corners, as the core isometric boxes are outlined
  createOutlines({
    instances: () => (outlined && !roundedRects ? boxes : []),
    stroke: strokeOf,
    strokeWidth: () => strokeWidth,
    opacity: () => strokeAlpha,
    dash,
  });
</script>

{#if roundedRects}
  <BarsRounded
    bars={boxes}
    corners={radiiOf}
    height={0.1}
    {filled}
    stroke={(d) => (outlined ? strokeOf(d) : null)}
    {strokeWidth}
    opacity={fillAlpha}
    lineOpacity={strokeAlpha}
    tooltip={tooltip && dataMode}
    {events}
    {dashArray}
  />
{/if}
