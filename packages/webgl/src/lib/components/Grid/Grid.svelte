<script lang="ts" module>
  import type { TicksConfig } from 'layerchart';

  export type GridProps = {
    /**
     * Draw lines at the `x` scale's ticks, across the floor and up the wall behind.
     *
     * @default true
     */
    x?: boolean;
    /**
     * Draw lines at the `y` scale's ticks, across the floor and up the wall behind.
     *
     * @default true
     */
    y?: boolean;
    /**
     * Draw lines at the `z` scale's ticks, around both walls.
     *
     * @default true
     */
    z?: boolean;
    /** The `x` ticks: a count, values, or an interval, as for `Axis` */
    xTicks?: TicksConfig;
    /** The `y` ticks: a count, values, or an interval, as for `Axis` */
    yTicks?: TicksConfig;
    /** The `z` ticks: a count, values, or an interval, as for `Axis` */
    zTicks?: TicksConfig;
    /**
     * Shade the floor and the two walls away from the camera.  The walls turn to stay behind
     * the plot as the camera orbits, and only stand when the chart has height (`z`).  Flat
     * (without a `view`), the floor is left clear, as LayerChart's `Grid` leaves it.
     *
     * @default true with a `view`, else false
     */
    walls?: boolean;
    /**
     * The lines' CSS color.
     *
     * @default 'color-mix(in oklab, var(--color-surface-content) 10%, transparent)'
     */
    stroke?: string;
    /** The floor and walls' CSS color */
    fill?: string;
  };
</script>

<script lang="ts">
  import {
    BufferGeometry,
    DoubleSide,
    Float32BufferAttribute,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    MeshBasicMaterial,
  } from 'three';
  import { autoTickVals, getChartContext } from 'layerchart';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { scaled, TICK_SPACING, tickCount } from '../../utils/marks.js';

  let {
    x = true,
    y = true,
    z = true,
    xTicks,
    yTicks,
    zTicks,
    walls: wallsProp,
    // As LayerChart's `Grid` draws its lines
    stroke = 'color-mix(in oklab, var(--color-surface-content, currentColor) 10%, transparent)',
    fill = 'color-mix(in oklab, var(--color-surface-content, currentColor) 4%, transparent)',
  }: GridProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  const walls = $derived(wallsProp ?? !!ctx.view);

  /** Spaced as `Axis` spaces them, if the ticks don't say */
  function ticks(scale: any, config: TicksConfig | undefined, length: number, spacing: number) {
    return autoTickVals(scale, config, tickCount(length, spacing)).map((v) => scaled(scale, v));
  }

  const lineMaterial = new LineBasicMaterial({ transparent: true, depthWrite: false });
  const lines = new LineSegments(new BufferGeometry(), lineMaterial);
  const planeMaterial = new MeshBasicMaterial({
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });
  const planes = new Mesh(new BufferGeometry(), planeMaterial);
  // Under the marks wherever they meet
  lines.renderOrder = planes.renderOrder = -1;
  scene.root.add(planes, lines);

  $effect(() => {
    const w = ctx.width;
    const h = ctx.height;
    const d = ctx.zDepth;
    // The walls stand on the sides away from the camera
    const fx = scene.far.x === 'min' ? 0 : w;
    const fy = scene.far.y === 'min' ? 0 : h;

    // In the scene's axes: chart x, then height, then chart y
    const segments: number[] = [];
    const segment = (...points: number[]) => segments.push(...points);

    const xs = x ? ticks(ctx.xScale, xTicks, w, TICK_SPACING.x) : [];
    const ys = y ? ticks(ctx.yScale, yTicks, h, TICK_SPACING.y) : [];
    const zs = z && d > 0 ? ticks(ctx.zScale, zTicks, d, TICK_SPACING.z) : [];

    for (const tx of xs) {
      segment(tx, 0, 0, tx, 0, h);
      if (d > 0) segment(tx, 0, fy, tx, d, fy);
    }
    for (const ty of ys) {
      segment(0, 0, ty, w, 0, ty);
      if (d > 0) segment(fx, 0, ty, fx, d, ty);
    }
    for (const tz of zs) {
      segment(fx, tz, 0, fx, tz, h);
      segment(0, tz, fy, w, tz, fy);
    }

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

    lines.geometry.dispose();
    lines.geometry = new BufferGeometry();
    lines.geometry.setAttribute('position', new Float32BufferAttribute(segments, 3));
    planes.geometry.dispose();
    planes.geometry = new BufferGeometry();
    planes.geometry.setAttribute('position', new Float32BufferAttribute(quads, 3));
    scene.invalidate();
  });

  $effect(() => {
    const line = scene.color(stroke);
    const plane = scene.color(fill);
    if (line) {
      lineMaterial.color.copy(line.color);
      lineMaterial.opacity = line.opacity;
    }
    if (plane) {
      planeMaterial.color.copy(plane.color);
      planeMaterial.opacity = plane.opacity;
    }
    scene.invalidate();
  });

  $effect(() => {
    return () => {
      scene.root.remove(planes, lines);
      lines.geometry.dispose();
      planes.geometry.dispose();
      lineMaterial.dispose();
      planeMaterial.dispose();
      scene.invalidate();
    };
  });
</script>
