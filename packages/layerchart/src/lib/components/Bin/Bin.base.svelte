<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { BinProps } from './Bin.shared.svelte.js';

  export type BinBaseLayerComponents = {
    Group: Component<any>;
    Path: Component<any>;
    ChartClipPath: Component<any>;
  };

  export type BinBaseProps = BinProps & BinBaseLayerComponents;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { get } from '@layerstack/utils';
  import { extent, max } from 'd3-array';
  import { scaleSequential } from 'd3-scale';
  import { interpolateYlGnBu } from 'd3-scale-chromatic';

  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { accessor as resolveAccessor } from '$lib/utils/common.js';
  import {
    colorPropDataKey,
    resolveColorProp,
    resolveDataProp,
    resolveStyleProp,
    type ColorProp,
  } from '$lib/utils/dataProp.js';
  import { isScaleOrdinal } from '$lib/utils/scales.svelte.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getFacetPanel, getMarkData } from '$lib/contexts/facet.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import { getLayerIsometric } from '$lib/contexts/isometric.js';
  import { binCells, binGrid, binGridPath, type BinCell } from './Bin.shared.svelte.js';

  const ctx = getChartContext();
  const markData = getMarkData();
  const facetPanel = getFacetPanel();
  const geo = getGeoContext();
  const layerIsometric = getLayerIsometric();

  let {
    Group,
    Path,
    ChartClipPath,
    data: dataProp,
    x: xProp,
    y: yProp,
    shape = 'hexagon',
    size = 20,
    grid = false,
    fill,
    fillOpacity,
    stroke,
    strokeOpacity,
    strokeWidth,
    opacity,
    r,
    z,
    class: className,
    children,
    onclick,
    onpointerenter,
    onpointermove,
    onpointerleave,
    ...restProps
  }: BinBaseProps = $props();

  ctx.registerComponent({
    name: 'Bin',
    kind: 'composite-mark',
    // Its own rows count toward the chart's domain, as a `Points` would
    markInfo: () => ({ data: dataProp, x: xProp, y: yProp }),
  });

  const xAccessor = $derived(xProp != null ? resolveAccessor(xProp) : ctx.x);
  const yAccessor = $derived(yProp != null ? resolveAccessor(yProp) : ctx.y);

  const data = $derived(markData(dataProp));

  /**
   * The cell width on the plot.  An isometric floor is refitted to the view as it turns, so there
   * `size` is measured against the floor laid flat — the cells then turn with the floor, holding the
   * same rows, rather than being re-cut at every angle.
   */
  const cellSize = $derived.by(() => {
    const floor = ctx.isometricFloor;
    if (!floor || !ctx.box.width || !ctx.box.height) return size;
    return size * Math.max(floor.width / ctx.box.width, floor.height / ctx.box.height);
  });

  const position = $derived.by(() => {
    const projection = geo.projection;
    if (projection) return (d: any) => projection([xAccessor(d), yAccessor(d)]);
    const xScale = ctx.xScale;
    const yScale = ctx.yScale;
    // Band scales place a row at the middle of its band
    const xOffset = (xScale.bandwidth?.() ?? 0) / 2;
    const yOffset = (yScale.bandwidth?.() ?? 0) / 2;
    return (d: any) =>
      [xScale(xAccessor(d)) + xOffset, yScale(yAccessor(d)) + yOffset] as [number, number];
  });

  function bin(rows: Iterable<any>) {
    if (!ctx.width || !ctx.height || !(cellSize > 0)) return [];
    return binCells(rows, position, { shape, size: cellSize });
  }

  const cells = $derived(bin(data));

  /** Every cell of the plot outlined, when drawing the `grid` */
  const gridPath = $derived(
    grid && ctx.width && ctx.height && cellSize > 0
      ? binGridPath(shape, cellSize, ctx.width, ctx.height)
      : null
  );

  /**
   * The cells the color ramp, `r`, and `z` are measured against: those of every row, even with
   * some hidden by the legend — so hiding a category leaves the rest as they were, the way the
   * chart's `cDomain` keeps its colors.  Only binned again while the legend hides something.
   */
  const scaledCells = $derived.by(() => {
    const rows = ctx.props.data;
    if (dataProp != null || facetPanel?.() || !Array.isArray(rows) || rows === ctx.data) {
      return cells;
    }
    return bin(rows);
  });

  /** The cell's value a color prop names, or `undefined` for a literal color */
  function colorValue(prop: ColorProp<BinCell> | undefined, cell: BinCell) {
    if (typeof prop === 'function') return prop(cell);
    return colorPropDataKey(prop, cell) != null ? get(cell, prop as string) : undefined;
  }

  /**
   * The scale a color prop's values go through: a ramp over their extent when they're numbers, as
   * `Contour` and `Density` do, else the chart's `cScale` for categories
   */
  function colorScaleFor(prop: ColorProp<BinCell> | undefined) {
    const values = scaledCells.map((cell) => colorValue(prop, cell));
    if (!values.some((v) => typeof v === 'number')) return ctx.cScale;
    const [lo = 0, hi = 1] = extent(values as number[]);
    // Not an ordinal scale — `cScale` defaults to a `series` color lookup, which can't ramp
    if (ctx.cScale && !isScaleOrdinal(ctx.cScale)) {
      const scale = ctx.cScale.copy();
      return ctx.props.cDomain ? scale : scale.domain([lo, hi]);
    }
    return scaleSequential([lo, hi], interpolateYlGnBu);
  }

  // No `fill` colors cells by their count
  const fillChannel = $derived(fill ?? 'count');
  const fillScale = $derived(colorScaleFor(fillChannel));
  const strokeScale = $derived(stroke == null ? null : colorScaleFor(stroke));

  /** Each cell's polygon scale, `1` filling it */
  const sizeOf = $derived.by(() => {
    if (r == null) return null;
    const full = binGrid(shape, cellSize).circumradius;
    if (typeof r === 'number') return () => r / full;
    // Area proportional to the value, so the largest fills its cell
    const largest = max(scaledCells, (cell) => resolveDataProp(r, cell, null, 0)) || 1;
    return (cell: BinCell) => Math.sqrt(Math.max(0, resolveDataProp(r, cell, null, 0)) / largest);
  });

  /** Each cell's `[start, end]` height when standing on an isometric floor */
  const heightOf = $derived.by(() => {
    if (z == null) return null;
    if (typeof z === 'number') return () => [0, z] as [number, number];
    const zScale = ctx.props.zDomain
      ? ctx.zScale
      : ctx.zScale
          .copy()
          .domain([0, max(scaledCells, (cell) => resolveDataProp(z, cell, null, 0)) || 1]);
    return (cell: BinCell) => [0, resolveDataProp(z, cell, zScale, 0)] as [number, number];
  });

  /** Cells back to front on an isometric floor, so nearer prisms paint over farther ones */
  const paintedCells = $derived.by(() => {
    const m = layerIsometric();
    if (!m || !heightOf) return cells;
    return [...cells].sort((a, b) => m.b * a.x + m.d * a.y - (m.b * b.x + m.d * b.y));
  });

  function pathData(cell: BinCell) {
    const k = sizeOf ? sizeOf(cell) : 1;
    if (!(k > 0)) return '';
    const points =
      k === 1
        ? cell.polygon
        : cell.polygon.map(([x, y]) => [cell.x + (x - cell.x) * k, cell.y + (y - cell.y) * k]);
    return `M${points.join('L')}Z`;
  }

  // Resolved together rather than called per attribute, which would cost a derived per cell each
  const items = $derived(
    paintedCells.map((cell) => ({
      cell,
      pathData: pathData(cell),
      z: heightOf?.(cell),
      fill: resolveColorProp(fillChannel, cell, fillScale),
      stroke: stroke == null ? undefined : resolveColorProp(stroke, cell, strokeScale),
      fillOpacity: resolveStyleProp(fillOpacity, cell),
      strokeOpacity: resolveStyleProp(strokeOpacity, cell),
      strokeWidth: resolveStyleProp(strokeWidth, cell),
      opacity: resolveStyleProp(opacity, cell),
    }))
  );
</script>

{#if gridPath}
  <!-- Its edge cells cross the plot's edges -->
  <ChartClipPath>
    <Path pathData={gridPath} {...extractLayerProps(grid, 'lc-bin-grid')} />
  </ChartClipPath>
{/if}

{#if children}
  {@render children({ cells })}
{:else if cells.length > 0}
  <Group {...restProps} class="lc-bin">
    <!-- Keyed by index, so canvas paints in the order listed here -->
    {#each items as item, i (i)}
      {@const cell = item.cell}
      <Path
        pathData={item.pathData}
        z={item.z}
        fill={item.fill}
        fillOpacity={item.fillOpacity}
        stroke={item.stroke}
        strokeOpacity={item.strokeOpacity}
        strokeWidth={item.strokeWidth}
        opacity={item.opacity}
        class={cls('lc-bin-cell', className)}
        onclick={onclick && ((e: MouseEvent) => onclick(e, cell))}
        onpointerenter={onpointerenter && ((e: PointerEvent) => onpointerenter(e, cell))}
        onpointermove={onpointermove && ((e: PointerEvent) => onpointermove(e, cell))}
        onpointerleave={onpointerleave && ((e: PointerEvent) => onpointerleave(e, cell))}
      />
    {/each}
  </Group>
{/if}

<style>
  @layer components {
    :global(:where(.lc-bin-cell)) {
      --stroke-color: none;
    }

    :global(:where(.lc-bin-grid)) {
      --fill-color: none;
      --stroke-color: color-mix(
        in oklab,
        var(--color-surface-content, currentColor) 10%,
        transparent
      );
      pointer-events: none;
    }
  }
</style>
