<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { BinProps, SphereBinning } from './Bin.shared.svelte.js';

  export type BinBaseLayerComponents = {
    Group: Component<any>;
    Path: Component<any>;
    ChartClipPath: Component<any>;
    /** Bins on the sphere instead of the plot — `GeoBin`'s */
    sphere?: SphereBinning;
    /** Cell spacing in degrees on the sphere — `GeoBin`'s */
    step?: number;
  };

  export type BinBaseProps = BinProps & BinBaseLayerComponents;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { extent, max } from 'd3-array';
  import { geoInterpolate, geoPath } from 'd3-geo';
  import { scaleSequential } from 'd3-scale';
  import { interpolateYlGnBu } from 'd3-scale-chromatic';

  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { accessor as resolveAccessor } from '$lib/utils/common.js';
  import {
    extractRawDataValue,
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
    sphere,
    step,
    data: dataProp,
    x: xProp,
    y: yProp,
    weight,
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
  const weightAccessor = $derived(weight != null ? resolveAccessor(weight) : undefined);

  const data = $derived(markData(dataProp));

  /**
   * The cell width on the plot.  An isometric floor is refitted to the view as it turns, so there
   * `size` is measured against the floor laid flat — the cells then turn with the floor, holding the
   * same rows, rather than being re-cut at every angle.
   */
  const cellSize = $derived(size * ctx.floorScale);

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

  /**
   * Binning on the sphere (`GeoBin`), its grid of cells `size` pixels apart at the projection's
   * center.  The same grid however the globe turns, so its rows are only binned again when the data
   * or zoom changes.
   */
  const globeGrid = $derived.by(() => {
    const projection = geo.projection;
    if (!sphere || !projection || !(cellSize > 0 || (step ?? 0) > 0)) return null;
    // `cellSize`, so on an isometric floor — which the projection is fitted to, and refitted as it
    // turns — the grid keeps its resolution
    return sphere.grid(shape, projection.scale(), cellSize, step);
  });

  function bin(rows: Iterable<any>) {
    if (sphere && globeGrid) {
      return sphere.bin(rows, (d) => [xAccessor(d), yAccessor(d)], globeGrid, weightAccessor);
    }
    if (!ctx.width || !ctx.height || !(cellSize > 0)) return [];
    // Against the floor laid flat, so a row on a cell's edge stays in it as the floor turns
    return binCells(rows, position, {
      shape,
      size,
      scale: ctx.floorScale,
      weight: weightAccessor,
    });
  }

  const cells = $derived(bin(data));

  /** Draws a ring on the sphere through the projection, clipped at the globe's horizon */
  const spherePath = $derived(globeGrid && geo.projection ? geoPath(geo.projection) : null);

  /** Whether a cell center on the sphere faces the viewer */
  const facing = $derived(
    sphere && globeGrid && geo.projection ? sphere.facing(geo.projection, globeGrid) : null
  );

  /**
   * On a globe, the cells facing the viewer, placed by the projection — redone as it turns, while
   * the binning stays.  Elsewhere, the cells as binned.
   */
  const shownCells = $derived.by(() => {
    const projection = geo.projection;
    if (!sphere || !facing || !projection) return cells;
    const shown: BinCell[] = [];
    for (const cell of cells) if (facing(cell.center!)) shown.push(sphere.show(cell, projection));
    return shown;
  });

  /** Every cell of the plot (or globe) outlined, when drawing the `grid` */
  const gridPath = $derived.by(() => {
    if (!grid) return null;
    if (globeGrid && facing) {
      // Only those facing the viewer, as the far side's are clipped away anyway
      return spherePath?.(globeGrid.outline(facing));
    }
    return ctx.width && ctx.height && cellSize > 0
      ? binGridPath(shape, size, ctx.width, ctx.height, ctx.floorScale)
      : null;
  });

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

  /**
   * The scale a color prop's values go through: a ramp over their extent when they're numbers, as
   * `Contour` and `Density` do, else the chart's `cScale` for categories
   */
  function colorScaleFor(prop: ColorProp<BinCell> | undefined) {
    const values = scaledCells.map((cell) => extractRawDataValue(prop, cell));
    if (!values.some((v) => typeof v === 'number')) return ctx.cScale;
    // A domain the chart was given already maps these values — as steps (`scaleThreshold`) or a
    // ramp — so it's taken as is
    if (ctx.props.cDomain && ctx.cScale) return ctx.cScale;
    const [lo = 0, hi = 1] = extent(values as number[]);
    // Not an ordinal scale — `cScale` defaults to a `series` color lookup, which can't ramp
    if (ctx.cScale && !isScaleOrdinal(ctx.cScale)) {
      return ctx.cScale.copy().domain([lo, hi]);
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
    if (typeof r === 'number') {
      const k = r / binGrid(shape, cellSize).circumradius;
      return () => k;
    }
    // Area proportional to the value, so the largest fills its cell
    const largest = max(scaledCells, (cell) => resolveDataProp(r, cell, null, 0)) || 1;
    return (cell: BinCell) => Math.sqrt(Math.max(0, resolveDataProp(r, cell, null, 0)) / largest);
  });

  /** Each cell's `[start, end]` height when standing on an isometric floor */
  const heightOf = $derived.by(() => {
    if (z == null) return null;
    if (typeof z === 'number') {
      const height: [number, number] = [0, z];
      return () => height;
    }
    const zScale = ctx.props.zDomain
      ? ctx.zScale
      : ctx.zScale
          .copy()
          .domain([0, max(scaledCells, (cell) => resolveDataProp(z, cell, null, 0)) || 1]);
    return (cell: BinCell) => [0, resolveDataProp(z, cell, zScale, 0)] as [number, number];
  });

  /**
   * Cells back to front on an isometric floor, so nearer prisms — or whatever `children` stands on
   * them — paint over farther ones
   */
  const paintedCells = $derived.by(() => {
    const m = layerIsometric();
    if (!m || !(heightOf || children)) return shownCells;
    return [...shownCells].sort((a, b) => m.b * a.x + m.d * a.y - (m.b * b.x + m.d * b.y));
  });

  /**
   * A cell's ring on the sphere, shrunk `k` toward its center along the sphere so the projection
   * still clips it at the horizon
   */
  function sphereRing(cell: BinCell, k: number) {
    const ring = sphere!.ring(cell)!;
    const center = cell.center!;
    return k === 1 ? ring : ring.map((p) => geoInterpolate(center, p)(k));
  }

  function pathData(cell: BinCell) {
    const k = sizeOf ? sizeOf(cell) : 1;
    if (!(k > 0)) return '';
    if (spherePath) {
      return spherePath({ type: 'Polygon', coordinates: [sphereRing(cell, k)] }) ?? '';
    }
    const points =
      k === 1
        ? cell.polygon
        : cell.polygon.map(([x, y]) => [cell.x + (x - cell.x) * k, cell.y + (y - cell.y) * k]);
    return `M${points.join('L')}Z`;
  }

  /**
   * As many sides as a column can show — the most corners any cell has.  Each column always draws
   * that many, blank where a side faces away: on canvas, one mounted as the globe turns would paint
   * after every column, over nearer ones.
   */
  const sideSlots = $derived(globeGrid?.corners ?? 0);

  /** A cell's colors and styles */
  function styleOf(cell: BinCell) {
    return {
      fill: resolveColorProp(fillChannel, cell, fillScale),
      stroke: stroke == null ? undefined : resolveColorProp(stroke, cell, strokeScale),
      fillOpacity: resolveStyleProp(fillOpacity, cell),
      strokeOpacity: resolveStyleProp(strokeOpacity, cell),
      strokeWidth: resolveStyleProp(strokeWidth, cell),
      opacity: resolveStyleProp(opacity, cell),
    };
  }

  /**
   * On a globe with `z`, each cell facing the viewer stood up as a column off the sphere, back to
   * front so nearer ones paint over farther ones.  (On an isometric floor, `Path` raises cells
   * instead.)
   */
  const columnItems = $derived.by(() => {
    const projection = geo.projection;
    if (!sphere || !heightOf || !projection || layerIsometric()) return null;
    if (!((projection.clipAngle?.() ?? 0) > 0)) return null;
    const columnOf = sphere.columns(projection);
    return shownCells
      .flatMap((cell) => {
        const k = sizeOf ? sizeOf(cell) : 1;
        const column = k > 0 && columnOf(sphereRing(cell, k), cell.center!, heightOf(cell)[1]);
        return column ? [{ cell, column }] : [];
      })
      .sort((a, b) => a.column.depth - b.column.depth)
      .map(({ cell, column }) => ({
        cell,
        ...column,
        shades: Array.from(
          { length: sideSlots },
          (_, i) => column.shades[i] ?? { d: '', opacity: 0 }
        ),
        ...styleOf(cell),
      }));
  });

  // Resolved together rather than called per attribute, which would cost a derived per cell each
  const items = $derived(
    paintedCells.map((cell) => ({
      cell,
      pathData: pathData(cell),
      z: heightOf?.(cell),
      ...styleOf(cell),
    }))
  );
</script>

{#if gridPath}
  <!-- Its edge cells cross the plot's edges -->
  <ChartClipPath>
    <Path pathData={gridPath} {...extractLayerProps(grid, 'lc-bin-grid')} />
  </ChartClipPath>
{/if}

{#snippet cellPath(
  item: ReturnType<typeof styleOf> & { cell: BinCell },
  d: string,
  z?: [number, number]
)}
  {@const cell = item.cell}
  <Path
    pathData={d}
    {z}
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
{/snippet}

{#if children}
  {@render children({ cells: paintedCells })}
{:else if columnItems || shownCells.length > 0}
  <Group {...restProps} class="lc-bin">
    <!-- Keyed by index, so canvas paints in the order listed here -->
    {#if columnItems}
      {#each columnItems as item, i (i)}
        <!-- The sides take the cell's color but not its stroke, as an isometric chart's do.  Drawn
             whether or not any face the viewer, so nothing mounts as the globe turns -->
        <Path
          pathData={item.sides}
          fill={item.fill}
          fillOpacity={item.fillOpacity}
          opacity={item.opacity}
          class={cls('lc-bin-side', className)}
        />
        {#each item.shades as shade}
          <Path
            pathData={shade.d}
            fill="black"
            fillOpacity={shade.opacity}
            opacity={item.opacity}
            class="lc-bin-side-shade"
          />
        {/each}
        {@render cellPath(item, item.top)}
      {/each}
    {:else}
      {#each items as item, i (i)}
        {@render cellPath(item, item.pathData, item.z)}
      {/each}
    {/if}
  </Group>
{/if}

<style>
  @layer components {
    :global(:where(.lc-bin-cell, .lc-bin-side, .lc-bin-side-shade)) {
      --stroke-color: none;
    }

    :global(:where(.lc-bin-side-shade)) {
      pointer-events: none;
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
