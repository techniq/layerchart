<script lang="ts" module>
  import type { WaffleProps } from 'layerchart';

  /** A cell's corner radius in pixels: `rx` / `ry` as SVG takes them (a number, or a percent) */
  function radiusOf(value: number | string | undefined, size: number) {
    if (value == null) return 0;
    if (typeof value === 'string' && value.trim().endsWith('%')) {
      return (parseFloat(value) / 100) * size;
    }
    return Number(value) || 0;
  }

  /** A waffle's outline (`WaffleItem.pathData`: `M x,y L x,y ... Z`) as points */
  function outlinePoints(pathData: string): [number, number][] {
    return pathData
      .replace(/[MZ]/g, '')
      .split('L')
      .map((pair) => pair.split(',').map(Number) as [number, number])
      .filter((p) => p.length === 2 && p.every(Number.isFinite));
  }

  /** A ring of points back to its first */
  function closed(points: [number, number][]) {
    return points.length ? [...points, points[0]] : points;
  }
</script>

<!-- LayerChart's `Waffle`: each row's cells, laid out as the core `Waffle` lays them out, drawn
     as the boxes its cell pattern paints (cut short where a value ends part way through a cell) -->
<script lang="ts">
  import { untrack } from 'svelte';
  import { Color, BoxGeometry } from 'three';
  import { accessor } from 'layerchart';
  import { WaffleState } from 'layerchart/base';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { createInstances, type Instance } from '../../utils/instances.svelte.js';
  import { createMerged } from '../../utils/merged.svelte.js';
  import { rowColor } from '../../utils/marks.js';
  import BarsRounded from '../Bars/Bars.rounded.svelte';

  let {
    data: dataProp,
    x: xProp,
    y: yProp,
    x1: x1Prop,
    y1: y1Prop,
    axis,
    unit,
    multiple,
    gap,
    round,
    rx,
    ry,
    seriesKey,
    insets,
    width,
    height,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    opacity,
    class: className,
    style,
    tooltip,
    onWaffleClick,
    onpointerenter,
    onpointermove,
    onpointerleave,
    onclick,
  }: WaffleProps = $props();

  const c = new WaffleState(
    () =>
      ({
        data: dataProp,
        x: xProp,
        y: yProp,
        x1: x1Prop,
        y1: y1Prop,
        axis,
        unit,
        multiple,
        gap,
        round,
        rx,
        ry,
        seriesKey,
        insets,
        width,
        height,
        fill,
      }) as WaffleProps
  );

  const scene = getSceneContext();
  /** What its `class` sets */
  const look = $derived(
    scene.style(
      typeof className === 'string' ? className : undefined,
      typeof style === 'string' && style ? { style } : undefined
    )
  );
  const highlight = new Color(0xffffff);

  /** A row's value range along the waffle's axis, as the core `Waffle` reads it */
  const valueOf = $derived(
    accessor(
      c.axis === 'y'
        ? (c.stackAccessors?.value ?? c.seriesAccessor ?? yProp ?? c.ctx.y)
        : (c.stackAccessors?.value ?? c.seriesAccessor ?? xProp ?? c.ctx.x)
    )
  );

  /**
   * Every row's cells, in pixels: each the inset box the core `Waffle`'s pattern paints in its
   * tile, cut where the row's value starts or ends part way through it
   */
  const cells = $derived.by(() => {
    const out: (Instance & { radius: number })[] = [];
    const cellPixels = c.unit * Math.abs(c.pixelsPerUnit);
    if (!(cellPixels > 0)) return out;
    const inset = c.gap / 2;
    const vertical = c.axis === 'y';
    const dir = c.pixelsPerUnit < 0 ? -1 : 1;
    for (const item of c.items) {
      const raw = valueOf(item.data);
      const [v1, v2] = Array.isArray(raw)
        ? [Number(raw[0]) || 0, Number(raw[1]) || 0]
        : [0, Number(raw) || 0];
      const a = c.round(v1 / c.unit);
      const b = c.round(v2 / c.unit);
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      // Cells to a row (`cy` is a row's length along the value axis)
      const columns = Math.max(1, Math.round(item.cy / cellPixels));
      const color = rowColor(
        c.ctx,
        item.fill ?? (typeof fill === 'string' ? fill : undefined),
        undefined,
        'var(--color-primary, currentColor)',
        look?.fill,
        look?.fillSet
      );
      const radius = radiusOf(rx ?? ry, item.cx - 2 * inset);
      for (let k = Math.floor(lo); k < Math.ceil(hi); k++) {
        const from = Math.max(lo, k) - k;
        const to = Math.min(hi, k + 1) - k;
        if (!(to > from)) continue;
        const col = ((k % columns) + columns) % columns;
        const row = Math.floor(k / columns);
        // Across the waffle: its tile, inset
        const across0 = col * item.cx + inset;
        const across1 = (col + 1) * item.cx - inset;
        // Along the value axis: the tile's inset box, cut to the part of the cell the value covers
        const tile = [dir * row * item.cy, dir * (row + 1) * item.cy];
        const piece = [dir * (row + from) * item.cy, dir * (row + to) * item.cy];
        const along0 = Math.max(Math.min(...tile) + inset, Math.min(...piece));
        const along1 = Math.min(Math.max(...tile) - inset, Math.max(...piece));
        if (!(across1 > across0) || !(along1 > along0)) continue;
        out.push({
          d: item.data,
          x: item.tx + (vertical ? across0 : along0),
          y: item.ty + (vertical ? along0 : across0),
          width: vertical ? across1 - across0 : along1 - along0,
          depth: vertical ? along1 - along0 : across1 - across0,
          z: 0,
          height: 0.3,
          color,
          radius,
        });
      }
    }
    return out;
  });

  const rounded = $derived(cells.some((cell) => cell.radius > 0));
  const fillAlpha = $derived(
    (opacity ?? 1) *
      c.seriesOpacity *
      (typeof fillOpacity === 'number' ? fillOpacity : 1) *
      (look?.opacity ?? 1)
  );

  /** Its pointer handlers, called with the waffle's row, as the core `Waffle`'s cells call them */
  const events = () => ({
    onclick:
      onclick || onWaffleClick
        ? (e: MouseEvent, { data }: { data: any }) => {
            onclick?.(e as any);
            onWaffleClick?.(e, { data });
          }
        : undefined,
    onpointerenter: onpointerenter && ((e: PointerEvent) => onpointerenter(e as any)),
    onpointermove: onpointermove && ((e: PointerEvent) => onpointermove(e as any)),
    onpointerleave: onpointerleave && ((e: PointerEvent) => onpointerleave(e as any)),
  });

  createInstances({
    tooltip: () => !!tooltip,
    events,
    geometry: new BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5),
    instances: () => (rounded ? [] : cells),
    opacity: () => fillAlpha,
    emphasize: (color) => color.lerp(highlight, 0.25),
  });

  // Its outline about each waffle (not each cell), as the core `Waffle`'s path is stroked, only
  // when it has one as it mounts (so waffles without cost nothing more)
  const strokeColor = $derived(
    stroke != null && stroke !== 'none'
      ? rowColor(c.ctx, stroke as string, undefined, 'currentColor', look?.stroke, look?.strokeSet)
      : null
  );
  if (untrack(() => stroke != null && stroke !== 'none')) {
    createMerged({
      items: () =>
        c.items.map((item) => ({
          d: item.data,
          geometry: null,
          fill: null,
          stroke: strokeColor,
          lines: [closed(outlinePoints(item.pathData)).flatMap(([px, py]) => [
            item.tx + px,
            0.6,
            item.ty + py,
          ])],
        })),
      opacity: () => fillAlpha,
      lineOpacity: () => (opacity ?? 1) * c.seriesOpacity,
      strokeWidth: () => Number(strokeWidth ?? look?.strokeWidth ?? 1),
    });
  }
</script>

{#if rounded}
  <BarsRounded
    bars={cells}
    corners={(bar) => {
      const r = (bar as Instance & { radius: number }).radius;
      return [r, r, r, r];
    }}
    height={0.1}
    stroke={() => null}
    strokeWidth={0}
    opacity={fillAlpha}
    tooltip={!!tooltip}
    {events}
  />
{/if}
