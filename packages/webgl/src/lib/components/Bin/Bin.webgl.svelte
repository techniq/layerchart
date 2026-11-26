<script lang="ts" module>
  import type { BinCell, DataProp } from 'layerchart';
  import type { BinProps } from './Bin.shared.svelte.js';
</script>

<script lang="ts">
  import { Color, Quaternion, Vector3 } from 'three';
  import { extent } from 'd3-array';
  import { scaleSequential } from 'd3-scale';
  import { interpolateYlGnBu } from 'd3-scale-chromatic';
  import { binCells, binGrid, getChartContext, isScaleOrdinal, resolveColorProp } from 'layerchart';

  import { createInstances, type Instance } from '../../utils/instances.svelte.js';
  import { createOutlines } from '../../utils/outlines.js';
  import { position, resolveAccessor } from '../../utils/marks.js';
  import { extrude, ShapeContext } from '../../utils/shapes.js';

  let {
    data: dataProp,
    x,
    y,
    weight,
    shape = 'hexagon',
    size = 20,
    gap = 0,
    z,
    fill = 'count',
    stroke,
    strokeWidth = 1,
    opacity = 1,
    tooltip = false,
    r,
  }: BinProps = $props();

  const ctx = getChartContext();

  const xAccessor = $derived(resolveAccessor(x, ctx.config.x));
  const yAccessor = $derived(resolveAccessor(y, ctx.config.y));
  const weightAccessor = $derived(weight == null ? undefined : resolveAccessor(weight, undefined));

  /** The rows grouped into cells of the grid, by where they land on the plot (or map) */
  const cells = $derived(
    binCells(
      (dataProp ?? ctx.data ?? []) as any[],
      (d) => position(ctx, xAccessor(d), yAccessor(d)),
      {
        shape,
        size,
        weight: weightAccessor as ((d: any) => number) | undefined,
      }
    )
  );

  /** A cell's value of a cell property or function, for its height or color */
  function cellValue(prop: unknown, cell: BinCell) {
    if (typeof prop === 'function') return prop(cell);
    if (typeof prop === 'string') return (cell as Record<string, unknown>)[prop];
    return undefined;
  }

  // Heights through the chart's `z` scale, whose domain has to reach them
  const zExtent = $derived.by((): [number, number] => {
    if (z == null || typeof z === 'number') return [0, 0];
    const values = cells.map((cell) => Number(cellValue(z, cell))).filter(Number.isFinite);
    return [0, values.length ? Math.max(...values) : 0];
  });
  ctx.registerComponent({
    name: 'Bin',
    kind: 'mark',
    markInfo: () => ({ zExtent }),
  });

  /**
   * The scale colors go through: a ramp over the cells' values when they're numbers, as
   * the core `Bin` colors them, else the chart's `cScale` for categories
   */
  const fillScale = $derived.by(() => {
    const values = cells.map((cell) => cellValue(fill, cell));
    if (!values.some((v) => typeof v === 'number')) return ctx.cScale;
    if (ctx.props.cDomain && ctx.cScale) return ctx.cScale;
    const [lo = 0, hi = 1] = extent(values as number[]);
    if (ctx.cScale && !isScaleOrdinal(ctx.cScale)) return ctx.cScale.copy().domain([lo, hi]);
    return scaleSequential([lo, hi], interpolateYlGnBu);
  });

  /**
   * One cell's prism, a pixel tall, on the floor about its center: every cell is the same shape,
   * so they're drawn as instances of it, stretched to their heights
   */
  /** One cell's corners about its center, in pixels, shrunk by `gap` */
  const corners = $derived.by((): [number, number][] => {
    const grid = binGrid(shape, size);
    const shrink = Math.max(0, grid.circumradius - gap / 2) / grid.circumradius;
    return grid.polygon(0, 0, true).map(([px, py]) => [px * shrink, py * shrink]);
  });
  const prism = $derived.by(() => {
    const context = new ShapeContext();
    corners.forEach(([px, py], i) => {
      if (i) context.lineTo(px, py);
      else context.moveTo(px, py);
    });
    context.closePath();
    return extrude(context, 0, 1, 1)!;
  });

  /**
   * How much of its cell each cell fills, by `r` as the core `Bin`: a value's area in proportion
   * (the largest filling its cell), or a pixel radius; all of it without one
   */
  const rMax = $derived.by(() => {
    if (r == null || typeof r === 'number') return 0;
    const values = cells.map((cell) => Number(cellValue(r, cell))).filter(Number.isFinite);
    return values.length ? Math.max(...values) : 0;
  });
  function fillOf(cell: BinCell) {
    if (r == null) return 1;
    if (typeof r === 'number') return r / binGrid(shape, size).circumradius;
    const value = Number(cellValue(r, cell));
    return rMax > 0 && Number.isFinite(value) ? Math.sqrt(Math.max(0, value) / rMax) : 0;
  }

  // A triangle pointing down is one pointing up, turned half round
  const turned = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI);
  const highlight = new Color(0xffffff);

  /** Each cell's prism: its center, height, turn, and color */
  const prisms = $derived<Instance[]>(
    cells.map((cell) => {
      const [z0, z1] = z == null ? [0, 1] : ctx.heightOf(cell, z as DataProp);
      // The apex above the center points up
      const down = shape === 'triangle' && cell.polygon[0][1] > cell.y;
      return {
        d: cell,
        x: cell.x,
        y: cell.y,
        z: Math.min(z0, z1),
        width: fillOf(cell),
        depth: fillOf(cell),
        // A pixel at least, above anything lying on the floor beneath (ex. a map)
        height: Math.max(Math.abs(z1 - z0), 1),
        color: resolveColorProp(fill, cell, fillScale) ?? 'var(--color-primary, currentColor)',
        rotation: down ? turned : undefined,
      };
    })
  );

  /** Outlined only when asked, so cells without one cost nothing more */
  const outlined = $derived(stroke != null);

  createInstances({
    tooltip: () => tooltip,
    geometry: () => prism,
    instances: () => prisms,
    opacity: () => opacity,
    emphasize: (color) => color.lerp(highlight, 0.25),
    // Giving way to its outline in depth, so the outline sits on its edges
    behind: () => outlined,
  });

  // Around each cell's top and up its corners, as the core `Bin` outlines its cells
  createOutlines({
    instances: () => (outlined ? prisms : []),
    stroke: (cell) => resolveColorProp(stroke, cell, ctx.cScale) ?? 'currentColor',
    strokeWidth: () => strokeWidth,
    opacity: () => opacity,
    footprint: () => corners,
  });
</script>
