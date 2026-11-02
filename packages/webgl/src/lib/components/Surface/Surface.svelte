<script lang="ts" module>
  import type { GridDataProps } from '../../utils/grid.js';
  import type { MotionOptions } from 'layerchart/utils/motion.svelte';

  export type SurfaceProps = GridDataProps & {
    /**
     * Pixels between samples of a function, scattered rows, or a grid on a map.
     *
     * @default 8
     */
    pixelSize?: number;
    /**
     * One CSS color for the whole surface.  Defaults to coloring by value, through the chart's
     * continuous color scale (`cScale`), else yellow-green-blue.
     */
    fill?: string;
    /** @default 1 */
    opacity?: number;
    /**
     * Draw grid lines over the surface: `true` along every few samples, or along every `n`th.
     *
     * @default false
     */
    wireframe?: boolean | number;
    /**
     * Draw contour lines at their heights: a count of evenly spaced thresholds, or the values.
     */
    contours?: number | number[];
    /**
     * The CSS color of wireframe and contour lines.
     *
     * @default 'color-mix(in oklab, var(--color-surface-content) 40%, transparent)'
     */
    stroke?: string;
    /**
     * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).
     *
     * @default false
     */
    tooltip?: boolean;
    /**
     * Ease to new values (ex. a new `value` function, or `data`) rather than jumping, ex. `'tween'`
     * or `{ type: 'tween', duration: 800 }`: heights, colors, and contours move together.  Values
     * on a different grid (ex. a new `pixelSize`) jump.
     */
    motion?: MotionOptions;
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
    MeshLambertMaterial,
  } from 'three';
  import { untrack } from 'svelte';
  import { getChartContext } from 'layerchart';
  import { createControlledMotion } from 'layerchart/utils/motion.svelte';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { cellCenter, contourSegments } from '../../utils/contours.js';
  import { getSphere } from '../../utils/globe.js';
  import { gridDatum, gridExtent, sampleGrid } from '../../utils/grid.js';
  import {
    sphereMesh,
    sphereSegments,
    sphereValueAt,
    sphereValues,
  } from '../../utils/sphere-surface.js';
  import { ColorRamp } from '../../utils/ramp.js';

  let {
    pixelSize = 8,
    fill,
    opacity = 1,
    wireframe = false,
    contours,
    stroke = 'color-mix(in oklab, var(--color-surface-content, currentColor) 40%, transparent)',
    tooltip = false,
    motion,
    ...gridProps
  }: SurfaceProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();

  /** On a `globe`, relief raised out from it (no wireframe or contours there yet) */
  const sphere = $derived(getSphere(ctx));
  const sphereSamples = $derived(
    sphere ? sphereValues(sphere, gridProps, sphereSegments(sphere.radius, pixelSize)) : null
  );
  const sampled = $derived(sphere ? null : sampleGrid(ctx, gridProps, pixelSize));

  // The motion is fixed when the mark mounts, as LayerChart's marks' is
  const eased = untrack(() => (motion ? createControlledMotion<number[]>([], motion) : null));
  $effect.pre(() => {
    const next = sampled ? Array.from(sampled.values) : [];
    if (!eased) return;
    untrack(() => {
      // A new grid (or the first) has nothing to ease from
      if (eased.current.length !== next.length) {
        eased.set(next, eased.type === 'tween' ? { duration: 0 } : ({ instant: true } as any));
      } else {
        eased.set(next);
      }
    });
  });
  /** The grid as drawn: its values eased by `motion` */
  const grid = $derived(
    sampled && eased && eased.current.length === sampled.values.length
      ? { ...sampled, values: Float64Array.from(eased.current) }
      : sampled
  );
  const extent = $derived(
    sphereSamples ? gridExtent(sphereSamples.values) : grid ? gridExtent(grid.values) : null
  );

  // Its values are heights, so the `z` domain has to reach them.  Always a range, even before
  // there's a grid: a mark that registers nothing at first never registers.
  ctx.registerComponent({
    name: 'Surface',
    kind: 'mark',
    markInfo: () => ({ zExtent: extent ?? [0, 0] }),
  });

  const material = new MeshLambertMaterial({ vertexColors: true, side: DoubleSide });
  const mesh = new Mesh(new BufferGeometry(), material);
  mesh.castShadow = mesh.receiveShadow = true;
  const lineMaterial = new LineBasicMaterial({ transparent: true, depthWrite: false });
  const lines = new LineSegments(new BufferGeometry(), lineMaterial);
  scene.root.add(mesh, lines);

  // The surface
  $effect(() => {
    const g = grid;
    let geometry = new BufferGeometry();
    if (sphere && sphereSamples && extent) {
      const { values } = sphereSamples;
      const colors = new Float32Array(values.length * 4);
      const ramp = fill ? null : new ColorRamp(ctx, scene, extent);
      const uniform = fill ? scene.color(fill) : null;
      values.forEach((v, k) => {
        if (ramp) {
          const o = ramp.offset(v);
          colors.set(ramp.table.subarray(o, o + 4), k * 4);
        } else {
          const c = uniform?.color;
          colors.set([c?.r ?? 0.5, c?.g ?? 0.5, c?.b ?? 0.5, uniform?.opacity ?? 1], k * 4);
        }
      });
      // Each value's height above zero, out from the sphere
      const zero = Number(ctx.zScale(0));
      geometry = sphereMesh(
        sphere,
        sphereSamples.grid,
        (k) => (Number.isFinite(values[k]) ? Number(ctx.zScale(values[k])) - zero : NaN),
        colors
      );
    } else if (g && extent) {
      const { values, columns, rows } = g;
      const positions = new Float32Array(columns * rows * 3);
      const colors = new Float32Array(columns * rows * 4);
      const ramp = fill ? null : new ColorRamp(ctx, scene, extent);
      const uniform = fill ? scene.color(fill) : null;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < columns; i++) {
          const k = j * columns + i;
          const v = values[k];
          const [x, y] = cellCenter(g, i, j);
          positions.set([x, Number.isFinite(v) ? Number(ctx.zScale(v)) : 0, y], k * 3);
          if (ramp) {
            const o = ramp.offset(v);
            colors.set(ramp.table.subarray(o, o + 4), k * 4);
          } else {
            const c = uniform?.color;
            colors.set([c?.r ?? 0.5, c?.g ?? 0.5, c?.b ?? 0.5, uniform?.opacity ?? 1], k * 4);
          }
        }
      }
      // Two triangles a cell, wherever all four corners have a value
      const index: number[] = [];
      for (let j = 0; j < rows - 1; j++) {
        for (let i = 0; i < columns - 1; i++) {
          const a = j * columns + i;
          const b = a + 1;
          const c = a + columns;
          const d = c + 1;
          if (![a, b, c, d].every((k) => Number.isFinite(values[k]))) continue;
          index.push(a, c, b, b, c, d);
        }
      }
      geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new Float32BufferAttribute(colors, 4));
      geometry.setIndex(index);
      geometry.computeVertexNormals();
    }
    mesh.geometry.dispose();
    mesh.geometry = geometry;

    const translucent = opacity < 1 || (fill ? (scene.color(fill)?.opacity ?? 1) < 1 : false);
    material.opacity = opacity;
    if (material.transparent !== translucent) {
      material.transparent = translucent;
      material.needsUpdate = true;
    }
    scene.invalidate();
  });

  // Wireframe and contour lines
  $effect(() => {
    const g = grid;
    const segments: number[] = [];
    if (g && extent) {
      const { values, columns, rows } = g;
      const height = (v: number) => Number(ctx.zScale(v));
      // Lifted a pixel so the lines don't sink into the faces they lie on
      const lift = 1;

      if (wireframe) {
        const step =
          typeof wireframe === 'number' ? wireframe : Math.max(1, Math.round(24 / pixelSize));
        const vertex = (i: number, j: number) => {
          const v = values[j * columns + i];
          if (!Number.isFinite(v)) return null;
          const [x, y] = cellCenter(g, i, j);
          return [x, height(v) + lift, y];
        };
        const line = (a: number[] | null, b: number[] | null) => {
          if (a && b) segments.push(...a, ...b);
        };
        for (let j = 0; j < rows; j += step)
          for (let i = 0; i < columns - 1; i++) line(vertex(i, j), vertex(i + 1, j));
        for (let i = 0; i < columns; i += step)
          for (let j = 0; j < rows - 1; j++) line(vertex(i, j), vertex(i, j + 1));
      }

      if (contours != null) {
        // Appended in a loop: a busy surface's lines are too many to spread into `push`
        const lines = contourSegments(g, extent, contours, (v) => height(v) + lift);
        for (let k = 0; k < lines.length; k++) segments.push(lines[k]);
      }
    }
    lines.geometry.dispose();
    lines.geometry = new BufferGeometry();
    lines.geometry.setAttribute('position', new Float32BufferAttribute(segments, 3));
    scene.invalidate();
  });

  $effect(() => {
    const color = scene.color(stroke);
    if (color) {
      lineMaterial.color.copy(color.color);
      lineMaterial.opacity = color.opacity;
    }
    scene.invalidate();
  });

  // Tooltips: the value at the pointer, with where it is in data coordinates
  $effect(() => {
    if (!tooltip) return;
    return scene.addPickable({
      object: mesh,
      datum: (hit) => {
        const point = scene.toChart(hit.point);
        if (sphere && sphereSamples) {
          const [x, y] = sphere.fromScene([point.x, point.z, point.y]);
          const value = sphereValueAt(sphereSamples.grid, sphereSamples.values, x, y);
          return Number.isFinite(value) ? { x, y, value } : undefined;
        }
        return grid ? gridDatum(ctx, grid, point.x, point.y) : undefined;
      },
    });
  });

  $effect(() => {
    return () => {
      scene.root.remove(mesh, lines);
      mesh.geometry.dispose();
      lines.geometry.dispose();
      material.dispose();
      lineMaterial.dispose();
      scene.invalidate();
    };
  });
</script>
