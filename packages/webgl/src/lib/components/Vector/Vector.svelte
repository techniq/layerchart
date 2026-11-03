<script lang="ts" module>
  import type { ColorProp, DataProp } from 'layerchart';

  export type VectorProps = {
    /** Rows to draw a vector each for.  Falls back to the chart's data when the props read rows. */
    data?: any[];
    /**
     * Where it's anchored across: a data property name or function of the row through the chart's
     * `x` scale (or longitude, through its projection), or pixels.
     *
     * @default 0
     */
    x?: DataProp;
    /**
     * Where it's anchored down: a data property name or function of the row through the chart's
     * `y` scale (or latitude, through its projection), or pixels.
     *
     * @default 0
     */
    y?: DataProp;
    /**
     * How long: a data property name or function of the row through the chart's `r` scale, or
     * pixels.
     *
     * @default 12
     */
    length?: DataProp;
    /**
     * Which way it points, in degrees clockwise from up the plot (its far edge, before the view
     * turns): a number, data property name, or function of the row.
     *
     * @default 0
     */
    rotate?: DataProp;
    /** @default 'arrow' */
    shape?: 'arrow' | 'arrow-filled' | 'spike';
    /** Which part of it is at `x` / `y`.  Defaults to `'start'` for filled shapes, else `'middle'`. */
    anchor?: 'start' | 'middle' | 'end';
    /** Width of the vector shape in pixels.  Defaults to a quarter of its length. */
    width?: number;
    /** Pixels up off the floor to draw at. @default 0 */
    z?: number;
    /**
     * A filled shape's color: a CSS color, or a key / function of the row run through the chart's
     * color scale
     *
     * @default 'var(--color-surface-content)'
     */
    fill?: ColorProp;
    /**
     * An arrow's color (or a filled shape's outline): a CSS color, or a key / function of the row
     * run through the chart's color scale
     *
     * @default 'var(--color-surface-content)'
     */
    stroke?: ColorProp;
    /** @default 1 */
    strokeWidth?: number;
    /**
     * CSS classes to style it by, as LayerChart's marks take them (ex. `stroke-red-500`): the
     * fill, stroke, stroke width, and opacity they set, where its props don't say
     */
    class?: string;
    /** @default 1 */
    opacity?: number;
    /**
     * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).  Only
     * filled shapes can be picked.
     *
     * @default false
     */
    tooltip?: boolean;
  };
</script>

<script lang="ts">
  import {
    extractRawDataValue,
    getChartContext,
    hasAnyDataProp,
    resolveDataProp,
    transformVectorPath,
    vectorArrowFilledPath,
    vectorArrowPath,
    vectorSpikePath,
  } from 'layerchart';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { createMerged } from '../../utils/merged.svelte.js';
  import { markRows, positionOf, rowColor } from '../../utils/marks.js';
  import { extrude, ShapeContext } from '../../utils/shapes.js';

  let {
    data,
    x = 0,
    y = 0,
    length = 12,
    rotate = 0,
    shape = 'arrow',
    anchor,
    width,
    z = 0,
    fill,
    stroke,
    strokeWidth: strokeWidthProp,
    class: className,
    opacity = 1,
    tooltip = false,
  }: VectorProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets, where its props don't say */
  const look = $derived(scene.style(className));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);

  const filled = $derived(shape !== 'arrow');
  const dataMode = $derived(hasAnyDataProp(x, y, length, rotate));

  /** A row's vector as LayerChart's `Vector` draws it: a path of moves and lines, in pixels */
  function pathOf(d: any) {
    const [px, py] = positionOf(ctx, x, y, d);
    const len = resolveDataProp(length, d, ctx.rScale, typeof length === 'number' ? length : 12);
    const turn = typeof rotate === 'number' ? rotate : Number(extractRawDataValue(rotate, d) ?? 0);
    const options = {
      length: len,
      anchor: anchor ?? (filled ? 'start' : 'middle'),
      width: width ?? len * 0.25,
    };
    const local =
      shape === 'spike'
        ? vectorSpikePath(options)
        : shape === 'arrow-filled'
          ? vectorArrowFilledPath(options)
          : vectorArrowPath(options);
    return transformVectorPath(local, px, py, turn);
  }

  /** A path's subpaths, as points */
  function subpaths(path: string) {
    const lines: [number, number][][] = [];
    for (const [, command, a, b] of path.matchAll(/([MLZ])(?:(-?[\d.e-]+),(-?[\d.e-]+))?/g)) {
      if (command === 'M') lines.push([[Number(a), Number(b)]]);
      else if (command === 'L') lines.at(-1)?.push([Number(a), Number(b)]);
      else if (lines.length) lines.at(-1)!.push([...lines.at(-1)![0]]);
    }
    return lines;
  }

  createMerged({
    tooltip: () => tooltip,
    items: () =>
      (dataMode ? markRows(ctx, data, x, y, length, rotate) : [undefined]).map((d) => {
        const lines = subpaths(pathOf(d));
        const color = 'var(--color-surface-content, currentColor)';
        const height = z + (filled ? 0.3 : 0.5);
        let geometry = null;
        if (filled) {
          const context = new ShapeContext();
          for (const line of lines) {
            line.forEach(([px, py], i) => (i ? context.lineTo(px, py) : context.moveTo(px, py)));
            context.closePath();
          }
          geometry = extrude(context, height, height);
        }
        const outlined = !filled || stroke != null || !!look?.stroke;
        return {
          d,
          geometry,
          fill: filled ? rowColor(ctx, fill, d, color, look?.fill) : null,
          lines: outlined
            ? lines.map((line) => line.flatMap(([px, py]) => [px, height + 0.2, py]))
            : [],
          stroke: outlined ? rowColor(ctx, stroke, d, color, look?.stroke) : null,
        };
      }),
    opacity: () => opacity * (look?.opacity ?? 1),
    strokeWidth: () => strokeWidth,
  });
</script>
