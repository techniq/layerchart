<script lang="ts" module>
  import type { ElevationEncoding, Tile } from '../../utils/tiles.js';

  export type GeoTileProps = {
    /** A tile's image URL, from its column, row, and zoom (an XYZ tile service, as LayerChart's) */
    url: (x: number, y: number, z: number) => string;
    /**
     * Zoom levels to add to (or take from) the one picked for the view, for sharper (or fewer)
     * tiles.
     *
     * @default 0
     */
    zoomDelta?: number;
    /**
     * Pixels across a tile, for picking the zoom.
     *
     * @default 256
     */
    tileSize?: number;
    /**
     * The deepest zoom the image tiles go to: deeper tiles show part of their ancestor's image,
     * enlarged (ex. imagery that stops at zoom 12 under terrain that doesn't)
     */
    maxZoom?: number;
    /**
     * Raise the tiles into terrain: an elevation tile's URL from its column, row, and zoom (ex.
     * AWS's open terrain tiles), its meters run through the chart's `z` scale
     */
    elevation?: (x: number, y: number, z: number) => string;
    /**
     * How the elevation tiles pack meters into their colors: `'terrarium'` (ex. AWS, Mapterhorn)
     * or `'mapbox'` (Terrain-RGB).
     *
     * @default 'terrarium'
     */
    elevationEncoding?: ElevationEncoding;
    /** The deepest zoom the elevation tiles go to (as `maxZoom`) */
    elevationMaxZoom?: number;
    /**
     * Points across each tile's mesh: more follow terrain (or a projection's curves) more closely.
     *
     * @default 64 with `elevation`, else 16
     */
    segments?: number;
    /**
     * Load each image anew rather than from those loaded before.
     *
     * @default false
     */
    disableCache?: boolean;
    /** @default 1 */
    opacity?: number;
    /**
     * Outline each tile, labeled with its zoom / column / row.
     *
     * @default false
     */
    debug?: boolean;
    /**
     * Show the tooltip for the longitude / latitude the pointer is over (with the chart's
     * `tooltipContext`), and its elevation.
     *
     * @default false
     */
    tooltip?: boolean;
    /** The tiles drawn, as `[x, y, z]`, when they change */
    ontiles?: (tiles: Tile[]) => void;
  };
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import {
    BufferGeometry,
    DoubleSide,
    Float32BufferAttribute,
    Box3,
    Frustum,
    Group,
    LinearFilter,
    LinearMipmapLinearFilter,
    LineBasicMaterial,
    LineSegments,
    MathUtils,
    Matrix4,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    OrthographicCamera,
    PerspectiveCamera,
    SRGBColorSpace,
    Texture,
    Vector3,
  } from 'three';
  import { getChartContext, isScaleLinear } from 'layerchart';

  import { getSceneContext, type SceneLabel } from '../../contexts/scene.svelte.js';
  import { getSphere } from '../../utils/globe.js';
  import { placer } from '../../utils/marks.js';
  import {
    ancestor,
    loadElevationTile,
    loadTileImage,
    peekElevationTile,
    peekTileImage,
    sampleElevation,
    tileCover,
    tileLatitude,
    tileLongitude,
    type ElevationTile,
  } from '../../utils/tiles.js';

  let {
    url,
    zoomDelta = 0,
    tileSize = 256,
    maxZoom = Infinity,
    elevation,
    elevationEncoding = 'terrarium',
    elevationMaxZoom = Infinity,
    segments,
    disableCache = false,
    opacity = 1,
    debug = false,
    tooltip = false,
    ontiles,
  }: GeoTileProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  const sphere = $derived(getSphere(ctx));

  /** The tiles covering the chart (padding included), as LayerChart's `GeoTile` picks them */
  const coverTiles = $derived.by(() => {
    const projection = ctx.geo.projection;
    if (!projection) return [];
    const center = projection([0, 0]) ?? [0, 0];
    return tileCover({
      scale: projection.scale(),
      center: [center[0] + ctx.padding.left, center[1] + ctx.padding.top],
      width: ctx.containerWidth,
      height: ctx.containerHeight,
      tileSize,
      zoomDelta,
    });
  });

  /** How deep the tiles go: as deep as the deepest service, else to street level */
  const deepest = $derived(
    Math.min(
      22,
      Number.isFinite(Math.max(maxZoom, elevationMaxZoom))
        ? Math.max(maxZoom, elevationMaxZoom)
        : 19
    )
  );

  /**
   * Bumped as the camera moves, at most every 100ms and once more as it stops: picking tiles
   * every frame of a drag only to load and drop them as it passes costs more than it shows
   */
  let looked = $state(0);
  let lookTimer: ReturnType<typeof setTimeout> | undefined;
  let lastLook = 0;
  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    scene.cameraVersion;
    const now = performance.now();
    clearTimeout(lookTimer);
    if (now - lastLook > 100) {
      lastLook = now;
      untrack(() => looked++);
    }
    lookTimer = setTimeout(() => {
      lastLook = performance.now();
      looked++;
    }, 100);
  });

  /**
   * In a 3D view, the tiles the camera sees, each as deep as it needs to be to look about
   * `tileSize` pixels across on screen (with `zoomDelta`, sharper or coarser): sharp up close and
   * coarse in the distance, refined as the camera moves in.  Starting from coarse tiles around
   * the map, each splits in four while it looks larger than that, and is left out off screen.
   */
  const viewTiles = $derived.by((): Tile[] | null => {
    const projection = ctx.geo.projection;
    const camera = scene.camera;
    if (!ctx.view || !projection || !camera || !scene.fitted) return null;
    // Follows the camera as it moves, a few times a second (see `looked`)
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    looked;
    camera.updateMatrixWorld();
    const frustum = new Frustum().setFromProjectionMatrix(
      new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    );
    const origin = scene.root.position;
    const place = placer(ctx, sphere);
    const globeCenter = sphere ? new Vector3(...sphere.center).add(origin) : null;
    // On a globe, a tile is curved: its corners alone don't bound it, and it faces away from the
    // camera on the far side.  Up close only a small cap of it is above the horizon, so a coarse
    // tile is sampled finely enough that some of its points land in that cap
    const horizon =
      sphere && globeCenter
        ? Math.acos(Math.min(1, sphere.radius / camera.position.distanceTo(globeCenter)))
        : 0;
    const grids = new Map<number, number[][]>();
    const samplesAt = (z: number) => {
      if (!sphere) {
        return [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ];
      }
      let grid = grids.get(z);
      if (!grid) {
        // A sample at least every half the horizon's reach across the tile, 3 × 3 at the least
        const across = (2 * Math.PI) / 2 ** z;
        const n = Math.min(32, Math.max(2, Math.ceil(across / Math.max(horizon / 2, 1e-3))));
        const steps = Array.from({ length: n + 1 }, (_, k) => k / n);
        grid = steps.flatMap((v) => steps.map((u) => [u, v]));
        grids.set(z, grid);
      }
      return grid;
    };
    const facing = new Vector3();
    const toCamera = new Vector3();
    // The tallest terrain, read without following it: tiles loading widen the `z` domain, and
    // picking tiles again for it would load more, without end
    const lift = untrack(() => Number(ctx.zScale(ctx.zDomain?.[1] ?? 0)) || 0);
    const target = tileSize / 2 ** zoomDelta;
    // Screen pixels a scene pixel spans a unit away (perspective), or anywhere (orthographic): the
    // camera frames the plot area, `ctx.box.height` pixels tall
    const area = untrack(() => ctx.box.height) || scene.height;
    const perspective = camera instanceof PerspectiveCamera;
    const focal = perspective ? area / 2 / Math.tan(MathUtils.degToRad(camera.fov) / 2) : 0;
    const orthoScale = perspective
      ? 0
      : (area * (camera as OrthographicCamera).zoom) /
        ((camera as OrthographicCamera).top - (camera as OrthographicCamera).bottom);

    const box = new Box3();
    const corner = new Vector3();
    const nearest = new Vector3();
    /** Whether a tile is in view, and about how many screen pixels across it looks */
    const measure = ([x, y, z]: Tile) => {
      box.makeEmpty();
      let faces = !globeCenter;
      for (const [i, j] of samplesAt(z)) {
        const lon = tileLongitude(x + i, z);
        const lat = tileLatitude(y + j, z);
        // From the ground to the tallest terrain, so a peak beside the view still counts
        for (const height of [0, lift]) {
          const [px, up, py] = place(lon, lat, height);
          if (!Number.isFinite(px) || !Number.isFinite(py)) return { visible: false, size: 0 };
          box.expandByPoint(corner.set(px, up, py).add(origin));
          if (globeCenter && !faces && height === 0) {
            facing.copy(corner).sub(globeCenter);
            faces = facing.dot(toCamera.copy(camera.position).sub(corner)) > 0;
          }
        }
      }
      if (!faces || !frustum.intersectsBox(box)) return { visible: false, size: 0 };
      const across = Math.max(box.max.x - box.min.x, box.max.z - box.min.z);
      if (!perspective) return { visible: true, size: across * orthoScale };
      const distance = box.clampPoint(camera.position, nearest).distanceTo(camera.position);
      return { visible: true, size: (across * focal) / Math.max(distance, across * 0.25) };
    };

    // Coarse tiles around the map to start from (the chart's own cover, three zooms up, and its
    // neighbors, as the camera can look past the map's edge); on a globe, the whole world
    const z0 = sphere ? 2 : Math.max(0, (coverTiles[0]?.[2] ?? 0) - 3);
    const roots = new Map<string, Tile>();
    if (sphere) {
      for (let y = 0; y < 1 << z0; y++)
        for (let x = 0; x < 1 << z0; x++) roots.set(`${x}/${y}`, [x, y, z0]);
    }
    for (const [x, y, z] of sphere ? [] : coverTiles) {
      const n = 1 << (z - z0);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const tile: Tile = [Math.floor(x / n) + dx, Math.floor(y / n) + dy, z0];
          if (tile[0] >= 0 && tile[1] >= 0 && tile[0] < 1 << z0 && tile[1] < 1 << z0)
            roots.set(tile.join('/'), tile);
        }
      }
    }

    const result: Tile[] = [];
    const visit = (tile: Tile) => {
      const { visible, size } = measure(tile);
      if (!visible) return;
      const [x, y, z] = tile;
      if (size > target && z < deepest && result.length < 256) {
        for (const [dx, dy] of [
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
        ])
          visit([x * 2 + dx, y * 2 + dy, z + 1]);
      } else result.push(tile);
    };
    for (const root of roots.values()) visit(root);
    return result;
  });

  /** The tiles drawn: those the camera sees in a 3D view, else those covering the chart */
  const tiles = $derived(viewTiles ?? coverTiles);

  $effect(() => ontiles?.(tiles));

  /** A tile once loaded: its mesh, and the image and elevation it's made from */
  type Entry = {
    tile: Tile;
    image: HTMLImageElement | null;
    imageKey: string;
    /** The ancestor its image comes from, and where in it this tile is */
    imagePart: ReturnType<typeof ancestor>;
    elevation: {
      data: ElevationTile;
      part: ReturnType<typeof ancestor>;
      range: [number, number];
    } | null;
    mesh: Mesh<BufferGeometry, MeshBasicMaterial | MeshLambertMaterial> | null;
    outline: LineSegments | null;
    /** Stops the pointer picking it for the tooltip */
    unpick: (() => void) | null;
    /** Its image (and elevation) has arrived, or failed to */
    loaded: boolean;
    /** No longer wanted, but shown until the tiles taking its place are drawn */
    stale: boolean;
    /** When it began fading in, while it is */
    fading: number | null;
  };
  /** Every tile wanted, loaded or loading, by its images' URLs */
  const entries = new Map<string, Entry>();
  const group = new Group();
  scene.root.add(group);

  /** Bumped as tiles load or go, for what depends on all of them (ex. the elevation's range) */
  let version = $state(0);

  /** Textures shared by tiles showing parts of one image, until none does */
  const textures = new Map<string, { texture: Texture; users: number }>();
  function takeTexture(key: string, image: HTMLImageElement) {
    let entry = textures.get(key);
    if (!entry) {
      const texture = new Texture(image);
      texture.colorSpace = SRGBColorSpace;
      texture.magFilter = LinearFilter;
      texture.minFilter = LinearMipmapLinearFilter;
      texture.anisotropy = 4;
      texture.needsUpdate = true;
      entry = { texture, users: 0 };
      textures.set(key, entry);
    }
    entry.users++;
    return entry.texture;
  }
  function releaseTexture(key: string) {
    const entry = textures.get(key);
    if (!entry || --entry.users > 0) return;
    entry.texture.dispose();
    textures.delete(key);
  }

  /** The grid of points across a tile, placed through the projection (or on the globe) */
  function geometryOf(entry: Entry) {
    const [x, y, z] = entry.tile;
    const n = segments ?? (entry.elevation ? 64 : 16);
    const place = placer(ctx, sphere);
    const height = heights(entry);
    const heightOf = (i: number, j: number) => height(i / n, j / n);

    // The grid, then (with elevation) a skirt hanging below each edge, so neighbors' slightly
    // different edge heights don't open cracks between them
    // In the mesh's height units: meters (a twentieth of the tile's rise, and some), or pixels
    const skirt = !entry.elevation
      ? 0
      : inMeters
        ? (entry.elevation.range[1] - entry.elevation.range[0]) * 0.05 + 10
        : 4 * scene.unit + 2;
    const positions: number[] = [];
    const uvs: number[] = [];
    const valid: boolean[] = [];
    const vertex = (i: number, j: number, drop = 0) => {
      const [px, up, py] = place(
        tileLongitude(x + i / n, z),
        tileLatitude(y + j / n, z),
        heightOf(i, j) - drop
      );
      positions.push(px, up, py);
      const { u0, v0, size } = entry.imagePart;
      uvs.push(u0 + (i / n) * size, 1 - (v0 + (j / n) * size));
      valid.push(Number.isFinite(px) && Number.isFinite(py) && Number.isFinite(up));
      return valid.length - 1;
    };
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) vertex(i, j);
    const index: number[] = [];
    const quad = (a: number, b: number, c: number, d: number) => {
      if (valid[a] && valid[b] && valid[c] && valid[d]) index.push(a, c, b, b, c, d);
    };
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const a = j * (n + 1) + i;
        quad(a, a + 1, a + n + 1, a + n + 2);
      }
    }
    if (skirt) {
      const edge = (points: [number, number][]) => {
        for (let k = 0; k < points.length - 1; k++) {
          const [i0, j0] = points[k];
          const [i1, j1] = points[k + 1];
          // Its own copies of the edge's points, so lighting the edge doesn't take in the skirt
          quad(vertex(i0, j0), vertex(i1, j1), vertex(i0, j0, skirt), vertex(i1, j1, skirt));
        }
      };
      const side = (f: (k: number) => [number, number]) =>
        edge(Array.from({ length: n + 1 }, (_, k) => f(k)));
      side((k) => [k, 0]);
      side((k) => [n, k]);
      side((k) => [n - k, n]);
      side((k) => [0, n - k]);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
    geometry.setIndex(index);
    if (entry.elevation || sphere) geometry.computeVertexNormals();
    return geometry;
  }

  /**
   * A tile's height (in pixels, out from the globe on one) at `u` / `v`, shares of it across and
   * down: its elevation through the `z` scale, else flat
   */
  function heights(entry: Entry) {
    const zScale = ctx.zScale;
    const zero = sphere ? Number(zScale(0)) : 0;
    const raw = inMeters;
    return (u: number, v: number) => {
      if (!entry.elevation) return 0;
      const { data, part } = entry.elevation;
      const meters = sampleElevation(data, part.u0 + u * part.size, part.v0 + v * part.size);
      return raw ? meters : Number(zScale(meters)) - zero;
    };
  }

  /**
   * On a flat map with a linear `z` scale, tiles are built with their heights in meters, and the
   * scale applied as each mesh's own height scale and offset: so a new `z` scale (as tiles load,
   * or an exaggeration changes) only rescales them, rather than building every tile again
   */
  const inMeters = $derived(!sphere && isScaleLinear(ctx.zScale));
  /** The `z` scale as a scale and offset, `meters × k + b` pixels */
  const heightScale = $derived.by(() => {
    const zero = Number(ctx.zScale(0)) || 0;
    const k = (Number(ctx.zScale(1)) || 0) - zero;
    // Flattened to nothing would leave nothing to pick (it can't be inverted)
    return { k: Math.abs(k) > 1e-9 ? k : 1e-9, b: zero };
  });

  /**
   * A tile's mesh scaled to the `z` scale (in meters), and while stale, pushed back in depth so
   * the tiles taking its place draw over it: where it is, rather than moved (which, with the camera
   * close, would shift it on screen and open gaps), and coarser ones further back
   */
  function fit(entry: Entry) {
    const mesh = entry.mesh;
    if (!mesh) return;
    const material = mesh.material;
    material.polygonOffset = entry.stale;
    material.polygonOffsetFactor = entry.stale ? 2 : 0;
    material.polygonOffsetUnits = entry.stale ? 4 * (24 - entry.imagePart.tile[2]) : 0;
    if (inMeters) {
      mesh.scale.set(1, heightScale.k, 1);
      mesh.position.set(0, heightScale.b, 0);
    } else {
      mesh.scale.set(1, 1, 1);
      mesh.position.set(0, 0, 0);
    }
  }

  /** The tile's edge, following its terrain a little above it, for `debug` */
  function outlineOf(entry: Entry) {
    const [x, y, z] = entry.tile;
    const place = placer(ctx, sphere);
    const height = heights(entry);
    // A little above it, in the mesh's height units
    const lift = (2 * scene.unit) / (inMeters ? heightScale.k : 1);
    const steps = 16;
    // Around the edge: along the top, down the right, back along the bottom, up the left
    const edge: [number, number][] = [];
    for (let k = 0; k < steps; k++) edge.push([k / steps, 0]);
    for (let k = 0; k < steps; k++) edge.push([1, k / steps]);
    for (let k = 0; k < steps; k++) edge.push([1 - k / steps, 1]);
    for (let k = 0; k <= steps; k++) edge.push([0, 1 - k / steps]);
    const points: number[] = [];
    for (let k = 0; k < edge.length - 1; k++) {
      for (const [u, v] of [edge[k], edge[k + 1]]) {
        points.push(...place(tileLongitude(x + u, z), tileLatitude(y + v, z), height(u, v) + lift));
      }
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
    return new LineSegments(geometry, outlineMaterial);
  }
  const outlineMaterial = new LineBasicMaterial({ color: 0xff3366 });

  /** Draw a loaded tile (again, after something it's placed by changed) */
  function draw(entry: Entry) {
    if (!entry.image) return;
    const geometry = geometryOf(entry);
    if (entry.mesh) {
      entry.mesh.geometry.dispose();
      entry.mesh.geometry = geometry;
    } else {
      const lit = !!(ctx.view && (entry.elevation || sphere));
      const options = { side: DoubleSide, transparent: true, opacity };
      const material = lit ? new MeshLambertMaterial(options) : new MeshBasicMaterial(options);
      material.map = takeTexture(entry.imageKey, entry.image);
      entry.mesh = new Mesh(geometry, material);
      entry.mesh.castShadow = entry.mesh.receiveShadow = lit;
      group.add(entry.mesh);
      if (untrack(() => tooltip)) entry.unpick = pick(entry);
      fadeIn(entry);
    }
    if (entry.outline) {
      entry.outline.removeFromParent();
      entry.outline.geometry.dispose();
      entry.outline = null;
    }
    if (debug) {
      // On the mesh, so it's scaled with it
      entry.outline = outlineOf(entry);
      entry.mesh.add(entry.outline);
    }
    fit(entry);
    scene.invalidate();
  }

  function remove(key: string, entry: Entry) {
    entries.delete(key);
    entry.unpick?.();
    if (entry.mesh) {
      group.remove(entry.mesh);
      entry.mesh.geometry.dispose();
      entry.mesh.material.dispose();
      releaseTexture(entry.imageKey);
    }
    if (entry.outline) {
      entry.outline.removeFromParent();
      entry.outline.geometry.dispose();
    }
  }

  // The tiles wanted: load those new to the view, and let go of those it's left
  $effect(() => {
    const wanted = new Map<string, { tile: Tile; imageKey: string; elevationKey: string | null }>();
    for (const tile of tiles) {
      const imagePart = ancestor(tile, maxZoom);
      const imageKey = url(...imagePart.tile);
      const elevationKey = elevation ? elevation(...ancestor(tile, elevationMaxZoom).tile) : null;
      wanted.set(`${tile.join('/')} ${imageKey} ${elevationKey}`, { tile, imageKey, elevationKey });
    }
    untrack(() => {
      // Those the view has left stay a moment, behind, until those taking their place
      // are drawn: so moving the camera never opens a hole while tiles load
      for (const [key, entry] of entries) {
        if (wanted.has(key)) {
          if (entry.stale) setStale(entry, false);
        } else if (!entry.mesh) remove(key, entry);
        else if (!entry.stale) setStale(entry, true);
      }
      for (const [key, { tile, imageKey, elevationKey }] of wanted) {
        if (entries.has(key)) continue;
        const imagePart = ancestor(tile, maxZoom);
        const part = ancestor(tile, elevationMaxZoom);
        const entry = blank(tile, imageKey, imagePart);
        entries.set(key, entry);
        // Drawn at once from what's loaded of an ancestor (ex. the tile it's zoomed in from),
        // blurrier until its own arrive, so zooming in never waits on an empty space
        const early = standIn(tile, !!elevationKey);
        if (early && !sharperBeneath(tile, early.imagePart.tile[2])) {
          Object.assign(entry, early);
          draw(entry);
        }
        Promise.all([
          loadImage(tile),
          elevationKey
            ? loadElevationTile(elevationKey, elevationEncoding).catch(() => null)
            : null,
        ]).then(
          ([loaded, data]) => {
            // Gone from the view while loading
            if (entries.get(key) !== entry) return;
            const own = blank(tile, loaded.imageKey, loaded.imagePart);
            own.image = loaded.image;
            if (data) own.elevation = { data, part, range: rangeOf(data, part) };
            own.loaded = true;
            if (entry.mesh) {
              if (
                entry.imageKey === loaded.imageKey &&
                entry.elevation?.data === own.elevation?.data
              ) {
                // Its own were already there to draw from
                entry.loaded = true;
                sweep();
                return;
              }
              // The stand-in stays beneath while its own fade in over it
              setStale(entry, true);
              entries.set(`${key} ~${++standIns}`, entry);
            }
            entries.set(key, own);
            draw(own);
            sweep();
            version++;
          },
          // With none of its ancestors' images either, it's left out, or left as its stand-in
          () => {
            entry.loaded = true;
            sweep();
          }
        );
      }
      sweep();
      // However long loading takes, those left behind go in a moment
      clearTimeout(sweepTimer);
      sweepTimer = setTimeout(() => sweep(true), 2000);
      version++;
    });
  });

  let standIns = 0;

  /** Images a service doesn't have (ex. open ocean past the zoom it stops at there) */
  const missing = new Set<string>();

  /**
   * A tile's image, or where the service has none for it (ex. satellite imagery that stops at
   * zoom 8 over open ocean), the nearest of its ancestors' (up to 8 zooms up) to show part of,
   * enlarged
   */
  async function loadImage(tile: Tile) {
    const top = Math.min(tile[2], maxZoom);
    for (let z = top; z >= Math.max(0, top - 8); z--) {
      const imagePart = ancestor(tile, z);
      const imageKey = url(...imagePart.tile);
      if (missing.has(imageKey)) continue;
      try {
        const image = await loadTileImage(imageKey, { cache: !disableCache });
        return { image, imageKey, imagePart };
      } catch {
        missing.add(imageKey);
      }
    }
    throw new Error(`No image for tile ${tile.join('/')}`);
  }

  function blank(tile: Tile, imageKey: string, imagePart: Entry['imagePart']): Entry {
    return {
      tile,
      image: null,
      imageKey,
      imagePart,
      elevation: null,
      mesh: null,
      outline: null,
      unpick: null,
      loaded: false,
      stale: false,
      fading: null,
    };
  }

  /** The lowest and highest elevation in the part of an elevation tile a tile shows */
  function rangeOf(data: ElevationTile, part: Entry['imagePart']): [number, number] {
    let min = Infinity;
    let max = -Infinity;
    for (let j = 0; j <= 16; j++) {
      for (let i = 0; i <= 16; i++) {
        const m = sampleElevation(
          data,
          part.u0 + (i / 16) * part.size,
          part.v0 + (j / 16) * part.size
        );
        if (m < min) min = m;
        if (m > max) max = m;
      }
    }
    return [min, max];
  }

  /**
   * What a tile can be drawn from right away: the nearest of its ancestors (up to 6 zooms up,
   * or itself) whose image, and elevation if it has one, are already loaded
   */
  function standIn(tile: Tile, withElevation: boolean) {
    if (disableCache) return null;
    const found = <T,>(deepest: number, peek: (part: Entry['imagePart']) => T | undefined) => {
      const top = Math.min(tile[2], deepest);
      for (let z = top; z >= Math.max(0, top - 6); z--) {
        const part = ancestor(tile, z);
        const value = peek(part);
        if (value) return { part, value };
      }
      return null;
    };
    const image = found(maxZoom, (part) => peekTileImage(url(...part.tile)));
    if (!image) return null;
    const terrain = withElevation
      ? found(elevationMaxZoom, (part) =>
          peekElevationTile(elevation!(...part.tile), elevationEncoding)
        )
      : null;
    if (withElevation && !terrain) return null;
    return {
      image: image.value,
      imageKey: url(...image.part.tile),
      imagePart: image.part,
      elevation: terrain
        ? { data: terrain.value, part: terrain.part, range: rangeOf(terrain.value, terrain.part) }
        : null,
    };
  }

  /** Whether `a` and `b` share any ground (one is the other, or within it) */
  function overlaps(a: Tile, b: Tile) {
    const z = Math.min(a[2], b[2]);
    return a[0] >> (a[2] - z) === b[0] >> (b[2] - z) && a[1] >> (a[2] - z) === b[1] >> (b[2] - z);
  }

  /** Whether tiles left behind over `tile` show it sharper than drawing it from zoom `from` would */
  function sharperBeneath(tile: Tile, from: number) {
    for (const entry of entries.values()) {
      if (entry.stale && entry.mesh && entry.imagePart.tile[2] > from && overlaps(entry.tile, tile))
        return true;
    }
    return false;
  }

  let sweepTimer: ReturnType<typeof setTimeout> | undefined;
  /**
   * Let go of tiles the view has left, each once the tiles wanted over it are drawn, at least as
   * sharp, and done fading in (or all of them `now`)
   */
  function sweep(now = false) {
    const wanted = [...entries.values()].filter((e) => !e.stale);
    for (const [key, entry] of [...entries]) {
      if (!entry.stale) continue;
      const from = entry.imagePart.tile[2];
      const covered = (e: Entry) =>
        e.fading == null && (e.loaded || (!!e.mesh && e.imagePart.tile[2] >= from));
      if (now || wanted.every((e) => !overlaps(e.tile, entry.tile) || covered(e)))
        remove(key, entry);
    }
    scene.invalidate();
  }

  /** How long a tile takes to fade in, over what it takes the place of */
  const fadeDuration = 200;
  let fadeFrame = 0;
  function fadeIn(entry: Entry) {
    entry.fading = performance.now();
    entry.mesh!.material.opacity = 0;
    // Over the tile beneath, rather than fighting it for depth
    entry.mesh!.renderOrder = 1;
    if (!fadeFrame) fadeFrame = requestAnimationFrame(fade);
  }
  function fade(now: number) {
    fadeFrame = 0;
    let done = false;
    let more = false;
    for (const entry of entries.values()) {
      if (entry.fading == null || !entry.mesh) continue;
      const t = Math.min(1, (now - entry.fading) / fadeDuration);
      entry.mesh.material.opacity = opacity * t;
      if (t < 1) more = true;
      else {
        entry.fading = null;
        entry.mesh.renderOrder = 0;
        done = true;
      }
    }
    if (done) sweep();
    scene.invalidate();
    if (more) fadeFrame = requestAnimationFrame(fade);
  }

  /** Mark a tile as left behind (or wanted again): drawn behind, so new tiles show over it */
  function setStale(entry: Entry, stale: boolean) {
    entry.stale = stale;
    fit(entry);
    scene.invalidate();
  }

  /** What the projection does, rather than which object it is (one can be made again the same) */
  const projectionKey = $derived.by(() => {
    const p = ctx.geo.projection as any;
    if (!p) return '';
    return JSON.stringify([p.scale?.(), p.translate?.(), p.rotate?.(), p.center?.()]);
  });

  // Built again when what places them changes: the projection, the globe, and (when heights
  // aren't in meters) the `z` scale
  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    [projectionKey, sphere, segments, ctx.view, debug, inMeters, inMeters ? null : ctx.zScale];
    untrack(() => {
      for (const entry of entries.values()) if (entry.mesh) draw(entry);
    });
  });

  // In meters, a new `z` scale only rescales them
  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    heightScale;
    untrack(() => {
      for (const entry of entries.values()) fit(entry);
    });
    scene.invalidate();
  });

  $effect(() => {
    for (const entry of entries.values())
      if (entry.mesh && entry.fading == null) entry.mesh.material.opacity = opacity;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    version;
    scene.invalidate();
  });

  // The elevation's range over the tiles drawn, to widen an automatic `zDomain`
  // Only ever widened (in 50m steps) while the map stays where it is: tiles coming and going as the
  // camera moves would otherwise keep changing it, and the `z` scale and the view's fit with it
  let widest: [number, number] | null = null;
  let widestFor = '';
  const zExtent = $derived.by((): [number, number] | null => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    version;
    const key = `${projectionKey} ${elevation ? untrack(() => elevation!(0, 0, 0)) : ''}`;
    if (key !== widestFor) [widest, widestFor] = [null, key];
    let min = widest?.[0] ?? Infinity;
    let max = widest?.[1] ?? -Infinity;
    for (const entry of untrack(() => [...entries.values()])) {
      if (!entry.elevation) continue;
      min = Math.min(min, Math.floor(entry.elevation.range[0] / 50) * 50);
      max = Math.max(max, Math.ceil(entry.elevation.range[1] / 50) * 50);
    }
    if (!(min <= max)) return null;
    if (widest && widest[0] === min && widest[1] === max) return widest;
    return (widest = [min, max]);
  });
  ctx.registerComponent({
    name: 'GeoTile',
    kind: 'mark',
    // Something from the start (a chart only follows marks with something to say when they
    // mount), with elevation to load
    markInfo: () => ({ zExtent: elevation ? (zExtent ?? [0, 0]) : undefined }),
  });

  // Each tile labeled with its zoom / column / row, for `debug`
  $effect(() => {
    if (!debug) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    version;
    const place = placer(ctx, sphere);
    const labels: SceneLabel[] = tiles.map(([x, y, z]) => {
      const [px, up, py] = place(tileLongitude(x + 0.5, z), tileLatitude(y + 0.5, z), 2);
      return {
        key: `${z}/${x}/${y}`,
        x: px,
        y: py,
        z: up,
        text: `${z}/${x}/${y}`,
        class: 'text-xs',
      };
    });
    return scene.addLabels(labels);
  });

  /** Let the pointer pick a tile for the tooltip: the longitude / latitude under it, and its elevation */
  function pick(entry: Entry) {
    return scene.addPickable({
      object: entry.mesh!,
      datum: (hit) => {
        const point = scene.toChart(hit.point);
        const [longitude, latitude] = sphere
          ? sphere.fromScene([point.x, point.z, point.y])
          : (ctx.geo.projection?.invert?.([point.x, point.y]) ?? [NaN, NaN]);
        if (!Number.isFinite(longitude)) return undefined;
        let meters: number | undefined;
        if (entry.elevation && hit.uv) {
          // Where in the tile it hit, from its image coordinates
          const { u0, v0, size } = entry.imagePart;
          const u = (hit.uv.x - u0) / size;
          const v = (1 - hit.uv.y - v0) / size;
          const { data, part } = entry.elevation;
          meters = sampleElevation(data, part.u0 + u * part.size, part.v0 + v * part.size);
        }
        return { longitude, latitude, elevation: meters, tile: entry.tile };
      },
    });
  }

  // Tiles drawn before `tooltip` was turned on (or off)
  $effect(() => {
    const on = tooltip;
    untrack(() => {
      for (const entry of entries.values()) {
        entry.unpick?.();
        entry.unpick = on && entry.mesh ? pick(entry) : null;
      }
    });
  });

  $effect(() => () => {
    clearTimeout(sweepTimer);
    clearTimeout(lookTimer);
    cancelAnimationFrame(fadeFrame);
    for (const [key, entry] of [...entries]) remove(key, entry);
    scene.root.remove(group);
    outlineMaterial.dispose();
    scene.invalidate();
  });
</script>
