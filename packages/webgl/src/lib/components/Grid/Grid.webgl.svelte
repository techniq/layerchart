<script lang="ts" module>
  import type { TicksConfig } from 'layerchart';
  import type { GridLineProps, GridProps } from './Grid.shared.svelte.js';
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import {
    BufferGeometry,
    DoubleSide,
    Float32BufferAttribute,
    Mesh,
    MeshBasicMaterial,
  } from 'three';
  import { autoTickVals, getChartContext, isScaleBand } from 'layerchart';

  import { getSceneContext, groupOpacity } from '../../contexts/scene.svelte.js';
  import { tickCount, tickSpacing } from '../../utils/marks.js';
  import { createSegments } from '../../utils/lines.js';
  import { dashPattern } from '../../utils/merged.svelte.js';
  import { createRowMotion } from '../../utils/rowMotion.svelte.js';
  import { circleSegments, pointRadial, polygonSegments } from '../../utils/radial.js';

  let {
    x: xProp,
    y: yProp,
    z: zProp,
    xTicks,
    yTicks,
    zTicks,
    bandAlign = 'center',
    radialY = 'circle',
    // As core's `Grid` draws its lines
    stroke = 'color-mix(in oklab, var(--color-surface-content, currentColor) 10%, transparent)',
    classes = {},
    motion,
    walls: wallsProp,
    fill = 'color-mix(in oklab, var(--color-surface-content, currentColor) 4%, transparent)',
  }: GridProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** Its objects, stacked with other marks' in the order they're declared */
  const layer = scene.layer();
  /** The `Group`s it's in dim it, as an SVG `<g>`'s opacity does */
  const inGroup = groupOpacity();
  const walls = $derived(wallsProp ?? !!ctx.view);

  /**
   * Which lines it draws: those turned on, as the core `Grid` (ex. `<Grid x />` only `x`'s), else
   * all those not turned off (a bare `<Grid />`, as a scene's grid is)
   */
  const all = $derived(!xProp && !yProp && !zProp);
  const x = $derived(xProp ?? all);
  const y = $derived(yProp ?? all);
  const z = $derived(zProp ?? all);

  /**
   * Where a band scale's line goes from its band's start, as the core `Grid` aligns them: through
   * the band's middle, or half the padding before it (`between`)
   */
  function bandOffset(scale: any) {
    if (!isScaleBand(scale)) return 0;
    const padding = scale.padding() * scale.step();
    return bandAlign === 'between' ? -padding / 2 : scale.step() / 2 - padding / 2;
  }

  /**
   * Each tick's line, keyed by its value: spaced as `Axis` spaces them, if the ticks don't say.
   * Between bands, there's one past the last band too, as the core `Grid` draws.
   */
  function ticks(scale: any, config: TicksConfig | undefined, length: number, spacing: number) {
    // A count asked for, else one per `spacing` (as `Axis` spaces them)
    const count =
      typeof config === 'number' ? config : spacing ? tickCount(length, spacing) : undefined;
    const values = autoTickVals(scale, config, count);
    const offset = bandOffset(scale);
    const lines = values.map((v) => ({ key: String(v), p: Number(scale(v)) + offset }));
    if (isScaleBand(scale) && bandAlign === 'between' && values.length) {
      const last = values[values.length - 1];
      lines.push({ key: `${String(last)}:end`, p: Number(scale(last)) + offset + scale.step() });
    }
    return lines;
  }

  // Each line eased to where its tick moves (none without `motion`)
  const eased = untrack(() => createRowMotion(motion, ['p']));
  /** Where each line is drawn: eased there with `motion`, noting it in `active` */
  function placed(axis: string, lines: { key: string; p: number }[], active: Set<string>) {
    if (!eased) return lines.map((l) => l.p);
    return lines.map(({ key, p }) => {
      const id = `${axis}:${key}`;
      active.add(id);
      untrack(() => eased.update(id, { p }));
      return eased.get(id)?.p ?? p;
    });
  }

  // A pixel wide on screen (not a device pixel), as the core `Grid`'s lines: a set an axis, each
  // styled as asked
  const sets = { x: createSegments(), y: createSegments(), z: createSegments() };
  const planeMaterial = new MeshBasicMaterial({
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });
  const planes = new Mesh(new BufferGeometry(), planeMaterial);
  // Under the marks wherever they meet
  planes.renderOrder = -1;
  for (const set of Object.values(sets)) set.object.renderOrder = -1;
  layer.add(planes, ...Object.values(sets).map((set) => set.object));

  // Around the center (in a `Layer center`), as the core `Grid` draws a `radial` chart's: spokes at
  // the `x` ticks (angles), and a circle (or a polygon through the spokes) at each `y` tick
  $effect(() => {
    if (!ctx.radial) return;
    const [r0, r1] = ctx.yRange as [number, number];
    // At the ticks the core `Grid` draws, rather than spaced as an axis' (it has none here)
    const xLines = x ? ticks(ctx.xScale, xTicks, 0, 0) : [];
    const yLines = y
      ? ticks(ctx.yScale, yTicks ?? (isScaleBand(ctx.yScale) ? undefined : 4), 0, 0)
      : [];
    const active = new Set<string>();
    const xs: number[] = [];
    for (const a of placed('x', xLines, active)) {
      const [x1, y1] = pointRadial(a, r0);
      const [x2, y2] = pointRadial(a, r1);
      xs.push(x1, 0, y1, x2, 0, y2);
    }
    const ys: number[] = [];
    // Through every `x` tick, drawn or not, as the core `Grid`'s
    const angles = radialY === 'linear' ? ticks(ctx.xScale, xTicks, 0, 0).map((l) => l.p) : [];
    for (const r of placed('y', yLines, active)) {
      ys.push(...(radialY === 'linear' ? polygonSegments(angles, r) : circleSegments(r)));
    }
    if (eased) untrack(() => eased.cleanup(active));
    for (const [set, segments] of [
      [sets.x, xs],
      [sets.y, ys],
      [sets.z, []],
    ] as const) {
      set.set(segments);
      if (set.object.material.dashed && segments.length) set.object.computeLineDistances();
    }
    planes.geometry.dispose();
    planes.geometry = new BufferGeometry();
    scene.invalidate();
  });

  $effect(() => {
    if (ctx.radial) return;
    const w = ctx.width;
    const h = ctx.height;
    const d = ctx.zDepth;
    // The walls stand on the sides away from the camera
    const fx = scene.far.x === 'min' ? 0 : w;
    const fy = scene.far.y === 'min' ? 0 : h;

    const xLines = x ? ticks(ctx.xScale, xTicks, w, tickSpacing(ctx, 'x')) : [];
    const yLines = y ? ticks(ctx.yScale, yTicks, h, tickSpacing(ctx, 'y')) : [];
    const zLines = z && d > 0 ? ticks(ctx.zScale, zTicks, d, tickSpacing(ctx, 'z')) : [];
    const active = new Set<string>();

    // In the scene's axes: chart x, then height, then chart y
    const xs: number[] = [];
    for (const tx of placed('x', xLines, active)) {
      xs.push(tx, 0, 0, tx, 0, h);
      if (d > 0) xs.push(tx, 0, fy, tx, d, fy);
    }
    const ys: number[] = [];
    for (const ty of placed('y', yLines, active)) {
      ys.push(0, 0, ty, w, 0, ty);
      if (d > 0) ys.push(fx, 0, ty, fx, d, ty);
    }
    const zs: number[] = [];
    for (const tz of placed('z', zLines, active)) {
      zs.push(fx, tz, 0, fx, tz, h);
      zs.push(0, tz, fy, w, tz, fy);
    }

    // Lines gone with their ticks ease in again should they return
    if (eased) untrack(() => eased.cleanup(active));

    const quads: number[] = [];
    const quad = (a: number[], b: number[], c: number[], e: number[]) =>
      quads.push(...a, ...b, ...c, ...a, ...c, ...e);
    if (walls) {
      quad([0, 0, 0], [w, 0, 0], [w, 0, h], [0, 0, h]);
      if (d > 0) {
        quad([fx, 0, 0], [fx, 0, h], [fx, d, h], [fx, d, 0]);
        quad([0, 0, fy], [w, 0, fy], [w, d, fy], [0, d, fy]);
      }
    }

    for (const [set, segments] of [
      [sets.x, xs],
      [sets.y, ys],
      [sets.z, zs],
    ] as const) {
      set.set(segments);
      // Along each line, for its dashes
      if (set.object.material.dashed && segments.length) set.object.computeLineDistances();
    }
    planes.geometry.dispose();
    planes.geometry = new BufferGeometry();
    planes.geometry.setAttribute('position', new Float32BufferAttribute(quads, 3));
    scene.invalidate();
  });

  /** An axis' lines styled: their own props, else their classes', else the grid's */
  function styleLines(set: (typeof sets)['x'], own: boolean | GridLineProps) {
    const props = typeof own === 'object' ? own : {};
    const root = scene.style(classes.root);
    const look = scene.style([classes.line, props.class].filter(Boolean).join(' '));
    const color = scene.color(props.stroke ?? look?.stroke ?? root?.stroke ?? stroke);
    const opacity = (props.opacity ?? look?.opacity ?? 1) * (root?.opacity ?? 1) * inGroup();
    set.style(
      color && { ...color, opacity: color.opacity * opacity },
      props.strokeWidth ?? look?.strokeWidth ?? root?.strokeWidth ?? 1
    );
    const material = set.object.material;
    const pattern = dashPattern(props.dashArray);
    if (material.dashed !== (pattern != null)) {
      material.dashed = pattern != null;
      material.needsUpdate = true;
      if (pattern && set.object.visible) set.object.computeLineDistances();
    }
    if (pattern) {
      material.dashSize = pattern[0] * scene.unit;
      material.gapSize = pattern[1] * scene.unit;
    }
  }

  $effect(() => {
    styleLines(sets.x, x);
    styleLines(sets.y, y);
    styleLines(sets.z, z);
    const plane = scene.color(fill);
    if (plane) {
      planeMaterial.color.copy(plane.color);
      planeMaterial.opacity = plane.opacity * inGroup();
    }
    scene.invalidate();
  });

  $effect(() => {
    return () => {
      layer.remove(planes, ...Object.values(sets).map((set) => set.object));
      for (const set of Object.values(sets)) set.dispose();
      planes.geometry.dispose();
      planeMaterial.dispose();
      scene.invalidate();
    };
  });
</script>
