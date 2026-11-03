<script lang="ts" module>
  import type { GridDataProps } from '../../utils/grid.js';

  export type RasterProps = GridDataProps & {
    /**
     * Pixels between samples of a function, scattered rows, or a grid on a map.
     *
     * @default 1
     */
    pixelSize?: number;
    /**
     * Height off the floor, in pixels.
     *
     * @default 0
     */
    z?: number;
    /** @default 1 */
    opacity?: number;
    /**
     * `'pixelated'` shows each cell as a hard-edged square; `'auto'` blends between them.
     *
     * @default 'auto'
     */
    imageRendering?: 'auto' | 'pixelated';
    /**
     * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).
     *
     * @default false
     */
    tooltip?: boolean;
  };
</script>

<script lang="ts">
  import {
    BufferGeometry,
    DataTexture,
    DoubleSide,
    Float32BufferAttribute,
    LinearFilter,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    NearestFilter,
    SRGBColorSpace,
  } from 'three';
  import { getChartContext } from 'layerchart';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
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
    pixelSize = 1,
    z = 0,
    opacity = 1,
    imageRendering = 'auto',
    tooltip = false,
    ...gridProps
  }: RasterProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();

  /** On a `globe`, the colors wrapped around it */
  const sphere = $derived(getSphere(ctx));
  const sphereSamples = $derived(
    sphere
      ? sphereValues(sphere, gridProps, sphereSegments(sphere.radius, Math.max(pixelSize, 2)))
      : null
  );
  const grid = $derived(sphere ? null : sampleGrid(ctx, gridProps, pixelSize));

  // An image of the grid's colors, unlit so they read true
  const material = new MeshBasicMaterial({ transparent: true, side: DoubleSide });
  /** On a globe, colored by vertex and lit, so it reads as round */
  const sphereMaterial = new MeshLambertMaterial({ vertexColors: true, transparent: true });
  const mesh = new Mesh<BufferGeometry, MeshBasicMaterial | MeshLambertMaterial>(
    new BufferGeometry(),
    material
  );
  mesh.receiveShadow = true;
  scene.root.add(mesh);

  $effect(() => {
    const g = grid;
    const extent = g ? gridExtent(g.values) : null;
    let texture: DataTexture | null = null;
    let geometry = new BufferGeometry();
    const sphereExtent = sphereSamples ? gridExtent(sphereSamples.values) : null;
    if (sphere && sphereSamples && sphereExtent) {
      const ramp = new ColorRamp(ctx, scene, sphereExtent);
      const colors = new Float32Array(sphereSamples.values.length * 4);
      sphereSamples.values.forEach((v, k) => {
        const o = ramp.offset(v);
        colors.set(ramp.table.subarray(o, o + 4), k * 4);
      });
      const values = sphereSamples.values;
      geometry = sphereMesh(
        sphere,
        sphereSamples.grid,
        (k) => (Number.isFinite(values[k]) ? z : NaN),
        colors
      );
    } else if (g && extent) {
      const ramp = new ColorRamp(ctx, scene, extent);
      const pixels = new Uint8Array(g.columns * g.rows * 4);
      g.values.forEach((v, k) => {
        if (!Number.isFinite(v)) return;
        const o = ramp.offset(v);
        pixels.set(ramp.bytes.subarray(o, o + 4), k * 4);
      });
      texture = new DataTexture(pixels, g.columns, g.rows);
      texture.colorSpace = SRGBColorSpace;
      texture.magFilter = texture.minFilter =
        imageRendering === 'pixelated' ? NearestFilter : LinearFilter;
      texture.needsUpdate = true;

      // The grid's first row is at its top (`top`), which is texture row 0 (`v = 0`)
      const { left, top, right, bottom } = g;
      geometry.setAttribute(
        'position',
        new Float32BufferAttribute(
          [left, z, top, right, z, top, left, z, bottom, right, z, bottom],
          3
        )
      );
      geometry.setAttribute('uv', new Float32BufferAttribute([0, 0, 1, 0, 0, 1, 1, 1], 2));
      geometry.setIndex([0, 2, 1, 1, 2, 3]);
    }
    material.map?.dispose();
    material.map = texture;
    material.opacity = sphereMaterial.opacity = opacity;
    material.needsUpdate = true;
    mesh.material = sphere ? sphereMaterial : material;
    mesh.geometry.dispose();
    mesh.geometry = geometry;
    scene.invalidate();
  });

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
      scene.root.remove(mesh);
      mesh.geometry.dispose();
      material.map?.dispose();
      material.dispose();
      sphereMaterial.dispose();
      scene.invalidate();
    };
  });
</script>
