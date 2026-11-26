<script lang="ts" module>
  import type { DataProp } from 'layerchart';
  import type { VectorProps } from './Vector.shared.svelte.js';
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import {
    extractRawDataValue,
    getChartContext,
    hasAnyDataProp,
    resolveDataProp,
    resolveStyleProp,
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
  import { createRowMotion } from '../../utils/rowMotion.svelte.js';
  import { extrude, ShapeContext } from '../../utils/shapes.js';

  let {
    x = 0,
    initialX,
    y = 0,
    initialY,
    length = 12,
    initialLength,
    rotate = 0,
    shape = 'arrow',
    anchor,
    width,
    data,
    key = (_, i) => i,
    motion,
    fill,
    stroke,
    fillOpacity = 1,
    strokeOpacity = 1,
    strokeWidth: strokeWidthProp,
    opacity = 1,
    class: className,
    tilt = 0,
    z,
    tooltip = false,
  }: VectorProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets, where its props don't say (a row's own, for a function of the row) */
  const look = $derived(typeof className === 'function' ? null : scene.style(className));
  const lookOf = (d: any, i: number) =>
    typeof className === 'function' ? scene.style(resolveStyleProp(className, d, i, rows)) : look;
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

  /** Each row's anchor and length, in pixels, by its `key` */
  const targets = $derived(
    rows.map((d, i) => {
      const [px, py] = positionOf(ctx, x, y, d);
      return { d, key: dataMode ? key(d, i) : 0, x: px, y: py, length: lengthOf(d) };
    })
  );

  /** Where a vector placed by pixels starts, as the core `Vector`'s `initialX` ... */
  const initial = $derived(
    dataMode
      ? undefined
      : Object.fromEntries(
          Object.entries({ x: initialX, y: initialY, length: initialLength }).filter(
            ([, value]) => value != null
          )
        )
  );

  // Easing each anchor and length to where they're asked to be, as the core `Vector`: a row at a
  // time by its `key`, and a vector placed by pixels from its `initial` ones
  const PROPS = ['x', 'y', 'length'] as const;
  const motionMap = createRowMotion(
    untrack(() => motion),
    PROPS
  );
  if (motionMap) {
    $effect(() => {
      const active = new Set<unknown>();
      for (const t of targets) {
        active.add(t.key);
        untrack(() => motionMap.update(t.key, t, initial));
      }
      untrack(() => motionMap.cleanup(active));
    });
  }

  /** Each vector's anchor and length where they are now */
  const vectors = $derived(
    motionMap ? targets.map((t) => ({ ...t, ...(motionMap.get(t.key) ?? initial) })) : targets
  );

  type Placed = (typeof targets)[number];

  /** A row's vector as the core `Vector` draws it: a path of moves and lines, in pixels */
  function pathOf({ d, x: px, y: py, length: len }: Placed) {
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

  // Flat (no `view`), drawn as core draws it: lines and filled shapes on the floor
  createMerged({
    tooltip: () => tooltip,
    items: () =>
      (ctx.view ? [] : vectors).map((vector, i) => {
        const d = vector.d;
        const look = lookOf(d, i);
        const lines = subpaths(pathOf(vector));
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
          fill: filled ? rowColor(ctx, fill, d, color, look?.fill, look?.fillSet) : null,
          lines: outlined
            ? lines.map((line) => line.flatMap(([px, py]) => [px, height + 0.2, py]))
            : [],
          stroke: outlined ? rowColor(ctx, stroke, d, color, look?.stroke, look?.strokeSet) : null,
        };
      }),
    opacity: () => opacity * fillOpacity * (look?.opacity ?? 1),
    lineOpacity: () => opacity * strokeOpacity * (look?.opacity ?? 1),
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
      return vectors.flatMap(({ d, x: px, y: py, length: len }, i) => {
        if (!Number.isFinite(px) || !Number.isFinite(py) || !(len > 0)) return [];
        const look = lookOf(d, i);
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
              ? rowColor(ctx, fill, d, color, look?.fill, look?.fillSet)
              : rowColor(ctx, stroke, d, color, look?.stroke, look?.strokeSet),
            rotation: new Quaternion().setFromUnitVectors(up, toward),
          },
        ];
      });
    },
    // A filled shape's fill, an arrow's stroke
    opacity: () => opacity * (filled ? fillOpacity : strokeOpacity) * (look?.opacity ?? 1),
    emphasize: (color) => color.offsetHSL(0, 0, 0.15),
  });
</script>
