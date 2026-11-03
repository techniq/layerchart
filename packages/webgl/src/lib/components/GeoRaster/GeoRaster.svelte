<script lang="ts" module>
  import type { GeoProjection } from 'd3-geo';
  import type { ImageSource } from '../../utils/texture.js';

  export type GeoRasterProps = {
    /**
     * The image to lay over the map through the chart's projection (ex. NASA's Blue Marble), or
     * wrap around its `globe`, as LayerChart's `GeoRaster` reprojects it: a URL, or an image,
     * canvas, or bitmap already drawn.  Equirectangular unless `sourceProjection` says otherwise:
     * longitude across it from -180° to 180°, latitude down it from 90° to -90°.
     */
    image: ImageSource;
    /**
     * The projection the image was drawn in, mapping longitude / latitude to its own pixels (as
     * LayerChart's `GeoRaster`).  Equirectangular without one.  Not on a `globe`, which wraps an
     * equirectangular image.
     */
    sourceProjection?: () => GeoProjection;
    /**
     * How the image is sampled between its pixels: `'nearest'` for crisp, blocky pixels, or
     * `'bilinear'` to blend them.  LayerChart's `GeoRaster` defaults to `'nearest'`, as blending
     * costs it ~4x the work; here the GPU blends for free.
     *
     * @default 'bilinear'
     */
    interpolate?: 'nearest' | 'bilinear';
    /** Draw the image's pixels as crisp blocks (as `interpolate: 'nearest'`) */
    pixelated?: boolean;
    /**
     * `crossOrigin` for an image loaded from a URL.  `null` for none.
     *
     * @default 'anonymous'
     */
    crossOrigin?: string | null;
    /**
     * Raise the image into terrain: a function of longitude and latitude returning a value for
     * the chart's `z` scale (ex. elevation in meters).
     */
    elevation?: (longitude: number, latitude: number) => number;
    /**
     * Pixels between the points the image is laid over.
     *
     * @default 4
     */
    pixelSize?: number;
    /** @default 1 */
    opacity?: number;
    /**
     * Show the tooltip for the longitude / latitude the pointer is over (with the chart's
     * `tooltipContext`), and its `elevation`.
     *
     * @default false
     */
    tooltip?: boolean;
  };
</script>

<script lang="ts">
  import {
    BufferGeometry,
    DoubleSide,
    Float32BufferAttribute,
    LinearFilter,
    LinearMipmapLinearFilter,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    NearestFilter,
  } from 'three';
  import { getChartContext } from 'layerchart';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { getSphere } from '../../utils/globe.js';
  import { gridExtent } from '../../utils/grid.js';
  import { sphereMesh, sphereSegments, sphereValues } from '../../utils/sphere-surface.js';
  import { loadTexture } from '../../utils/texture.js';

  let {
    image,
    sourceProjection,
    interpolate = 'bilinear',
    pixelated = false,
    crossOrigin = 'anonymous',
    elevation,
    pixelSize = 4,
    opacity = 1,
    tooltip = false,
  }: GeoRasterProps = $props();

  /** The image's size once loaded, for `sourceProjection` to map into */
  let imageSize = $state<{ width: number; height: number } | null>(null);
  /** Where longitude / latitude falls on the image, `[0, 1]` across and up */
  const uvOf = $derived.by(() => {
    const source = sourceProjection?.();
    const size = imageSize;
    if (!source) return (lon: number, lat: number) => [(lon + 180) / 360, (lat + 90) / 180];
    return (lon: number, lat: number) => {
      const p = size ? source([lon, lat]) : null;
      return p ? [p[0] / size!.width, 1 - p[1] / size!.height] : [NaN, NaN];
    };
  });

  const ctx = getChartContext();
  const scene = getSceneContext();

  /** On a `globe`, a sphere wrapped in the image */
  const sphere = $derived(getSphere(ctx));
  const sphereSamples = $derived(
    sphere
      ? sphereValues(
          sphere,
          { value: elevation ?? ((_lon: number, _lat: number) => 0) },
          sphereSegments(sphere.radius, pixelSize)
        )
      : null
  );

  /** The plot sampled every `pixelSize` pixels: where each point is on the globe, and its height */
  const samples = $derived.by(() => {
    const projection = ctx.geo.projection;
    if (sphere) return null;
    const width = ctx.width;
    const height = ctx.height;
    if (!projection?.invert || !width || !height) return null;
    const columns = Math.ceil(width / pixelSize) + 1;
    const rows = Math.ceil(height / pixelSize) + 1;
    const lonLat = new Float64Array(columns * rows * 2).fill(NaN);
    const values = new Float64Array(columns * rows).fill(NaN);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < columns; i++) {
        const px = Math.min(width, i * pixelSize);
        const py = Math.min(height, j * pixelSize);
        const point = projection.invert([px, py]);
        // Past some projections' edges (ex. Natural Earth's), the inverse still answers, off the globe
        if (!point || Math.abs(point[0]) > 180 || Math.abs(point[1]) > 90) continue;
        // Off the projection's clip (ex. beyond an Albers USA inset), it doesn't map back here
        const back = projection(point);
        if (!back || Math.hypot(back[0] - px, back[1] - py) > pixelSize) continue;
        const k = j * columns + i;
        lonLat[k * 2] = point[0];
        lonLat[k * 2 + 1] = point[1];
        values[k] = elevation ? elevation(point[0], point[1]) : 0;
      }
    }
    return { columns, rows, lonLat, values, width, height };
  });

  const extent = $derived(elevation ? gridExtent((sphereSamples ?? samples)?.values ?? []) : null);

  ctx.registerComponent({
    name: 'GeoRaster',
    kind: 'mark',
    markInfo: () => ({ zExtent: extent ?? [0, 0] }),
  });

  const flat = new MeshBasicMaterial({ side: DoubleSide, transparent: true });
  const lit = new MeshLambertMaterial({ side: DoubleSide, transparent: true });
  const mesh = new Mesh<BufferGeometry, MeshBasicMaterial | MeshLambertMaterial>(
    new BufferGeometry(),
    flat
  );
  mesh.castShadow = mesh.receiveShadow = true;
  scene.root.add(mesh);

  $effect(() => {
    const s = samples;
    let geometry = new BufferGeometry();
    if (sphere && sphereSamples) {
      // Raised out from the sphere by the elevation's height above zero
      const zero = Number(ctx.zScale(0));
      geometry = sphereMesh(sphere, sphereSamples.grid, (k) => {
        const value = sphereSamples.values[k];
        return elevation ? Number(ctx.zScale(value)) - zero : 0;
      });
    } else if (s) {
      const { columns, rows, lonLat, values } = s;
      const positions = new Float32Array(columns * rows * 3);
      const uvs = new Float32Array(columns * rows * 2);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < columns; i++) {
          const k = j * columns + i;
          const z = elevation && Number.isFinite(values[k]) ? Number(ctx.zScale(values[k])) : 0;
          positions.set(
            [Math.min(s.width, i * pixelSize), z, Math.min(s.height, j * pixelSize)],
            k * 3
          );
          uvs.set(uvOf(lonLat[k * 2], lonLat[k * 2 + 1]), k * 2);
        }
      }
      // Two triangles a cell, where every corner is on the map and none wraps the antimeridian
      const index: number[] = [];
      const u = (k: number) => uvs[k * 2];
      for (let j = 0; j < rows - 1; j++) {
        for (let i = 0; i < columns - 1; i++) {
          const a = j * columns + i;
          const corners = [a, a + 1, a + columns, a + columns + 1];
          if (!corners.every((k) => Number.isFinite(lonLat[k * 2]) && Number.isFinite(uvs[k * 2])))
            continue;
          const us = corners.map(u);
          if (Math.max(...us) - Math.min(...us) > 0.5) continue;
          index.push(a, a + columns, a + 1, a + 1, a + columns, a + columns + 1);
        }
      }
      geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
      geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
      geometry.setIndex(index);
      if (elevation) geometry.computeVertexNormals();
    }
    mesh.geometry.dispose();
    mesh.geometry = geometry;
    // Terrain (and a globe) is lit, so its slopes and roundness show; a flat image shows in its
    // own colors
    mesh.material = elevation || sphere ? lit : flat;
    scene.invalidate();
  });

  $effect(() => {
    // An image's own size, not as laid out on the page
    const sizeOf = (source: any) => ({
      width: source.naturalWidth || source.width,
      height: source.naturalHeight || source.height,
    });
    const texture = loadTexture(
      image,
      () => {
        imageSize = sizeOf(texture.image);
        scene.invalidate();
      },
      { crossOrigin }
    );
    imageSize = typeof image === 'string' ? null : sizeOf(image);
    const crisp = pixelated || interpolate === 'nearest';
    texture.magFilter = crisp ? NearestFilter : LinearFilter;
    texture.minFilter = crisp ? NearestFilter : LinearMipmapLinearFilter;
    flat.map = lit.map = texture;
    flat.needsUpdate = lit.needsUpdate = true;
    scene.invalidate();
    return () => texture.dispose();
  });

  // Tooltips: the longitude / latitude under the pointer
  $effect(() => {
    if (!tooltip) return;
    return scene.addPickable({
      object: mesh,
      datum: (hit) => {
        const point = scene.toChart(hit.point);
        const [longitude, latitude] = sphere
          ? sphere.fromScene([point.x, point.z, point.y])
          : (ctx.geo.projection?.invert?.([point.x, point.y]) ?? [NaN, NaN]);
        if (!Number.isFinite(longitude)) return undefined;
        return { longitude, latitude, value: elevation?.(longitude, latitude) };
      },
    });
  });

  $effect(() => {
    flat.opacity = lit.opacity = opacity;
    scene.invalidate();
  });

  $effect(() => {
    return () => {
      scene.root.remove(mesh);
      mesh.geometry.dispose();
      flat.dispose();
      lit.dispose();
      scene.invalidate();
    };
  });
</script>
