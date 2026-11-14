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
    /**
     * In a 3D view, how far it points up out of the floor, in degrees: `0` along the floor, `90`
     * straight up, `-90` straight down.  A number, data property name, or function of the row.
     *
     * @default 0
     */
    tilt?: DataProp;
    /** @default 'arrow' */
    shape?: 'arrow' | 'arrow-filled' | 'spike';
    /** Which part of it is at `x` / `y`.  Defaults to `'start'` for filled shapes, else `'middle'`. */
    anchor?: 'start' | 'middle' | 'end';
    /** Width of the vector shape in pixels.  Defaults to a quarter of its length. */
    width?: number;
    /**
     * Where it's anchored up off the floor: a data property name or function of the row through
     * the chart's `z` scale, or pixels.  On the floor without one.
     */
    z?: DataProp;
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

  import { ConeGeometry, CylinderGeometry, Quaternion, Vector3 } from 'three';
  import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { createInstances } from '../../utils/instances.svelte.js';
  import { createMerged } from '../../utils/merged.svelte.js';
  import { markRows, positionOf, rowColor } from '../../utils/marks.js';
  import { extrude, ShapeContext } from '../../utils/shapes.js';

  let {
    data,
    x = 0,
    y = 0,
    length = 12,
    rotate = 0,
    tilt = 0,
    shape = 'arrow',
    anchor,
    width,
    z,
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
  const dataMode = $derived(hasAnyDataProp(x, y, length, rotate, tilt, z));
  const rows = $derived(
    dataMode ? markRows(ctx, data, x, y, length, rotate, tilt, z) : [undefined]
  );

  /** A number prop, or a row's raw value for it (an angle, not through a scale) */
  const valueOf = (prop: DataProp, d: any) =>
    typeof prop === 'number' ? prop : Number(extractRawDataValue(prop, d) ?? 0);
  /** A row's height off the floor, in pixels */
  const heightOf = (d: any) => (z == null ? 0 : ctx.heightOf(d, z)[1]);
  const lengthOf = (d: any) =>
    resolveDataProp(length, d, ctx.rScale, typeof length === 'number' ? length : 12);

  /** A row's vector as LayerChart's `Vector` draws it: a path of moves and lines, in pixels */
  function pathOf(d: any) {
    const [px, py] = positionOf(ctx, x, y, d);
    const len = lengthOf(d);
    const turn = valueOf(rotate, d);
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

  // Flat (no `view`), drawn as LayerChart draws it: lines and filled shapes on the floor
  createMerged({
    tooltip: () => tooltip,
    items: () =>
      (ctx.view ? [] : rows).map((d) => {
        const lines = subpaths(pathOf(d));
        const color = 'var(--color-surface-content, currentColor)';
        const height = heightOf(d) + (filled ? 0.3 : 0.5);
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

  // In a 3D view, solid and lit, pointing any way: a shaft and a cone for an arrow (thicker for a
  // filled one), or one cone for a spike.  A unit shape along `y` from its base, a unit wide,
  // scaled out to each vector's length and width and turned to its direction.
  const head = 0.3;
  const glyph = (shaft: number) =>
    mergeGeometries([
      new CylinderGeometry(shaft, shaft, 1 - head, 12).translate(0, (1 - head) / 2, 0),
      new ConeGeometry(0.5, head, 20).translate(0, 1 - head / 2, 0),
    ]);
  const glyphs = {
    arrow: glyph(0.08),
    'arrow-filled': glyph(0.15),
    spike: new ConeGeometry(0.5, 1, 20).translate(0, 0.5, 0),
  };
  const up = new Vector3(0, 1, 0);
  const toward = new Vector3();
  const along = { start: 0, middle: 0.5, end: 1 };

  createInstances({
    tooltip: () => tooltip,
    geometry: () => glyphs[shape],
    instances: () => {
      if (!ctx.view) return [];
      const color = 'var(--color-surface-content, currentColor)';
      return rows.flatMap((d) => {
        const [px, py] = positionOf(ctx, x, y, d);
        const len = lengthOf(d);
        if (!Number.isFinite(px) || !Number.isFinite(py) || !(len > 0)) return [];
        const w = width ?? len * 0.25;
        // Clockwise from up the plot (towards its far edge, the scene's -z), and up off the floor
        const turn = (valueOf(rotate, d) * Math.PI) / 180;
        const lean = (valueOf(tilt, d) * Math.PI) / 180;
        toward.set(
          Math.sin(turn) * Math.cos(lean),
          Math.sin(lean),
          -Math.cos(turn) * Math.cos(lean)
        );
        // Its base back along its direction from the anchor; on the floor, resting on it
        const back = len * along[anchor ?? (filled ? 'start' : 'middle')];
        const base = (z == null ? w / 2 : heightOf(d)) - toward.y * back;
        return [
          {
            d,
            x: px - toward.x * back,
            y: py - toward.z * back,
            z: base,
            width: w,
            depth: w,
            height: len,
            color: filled
              ? rowColor(ctx, fill, d, color, look?.fill)
              : rowColor(ctx, stroke, d, color, look?.stroke),
            rotation: new Quaternion().setFromUnitVectors(up, toward),
          },
        ];
      });
    },
    opacity: () => opacity * (look?.opacity ?? 1),
    emphasize: (color) => color.offsetHSL(0, 0, 0.15),
  });
</script>
