<script lang="ts" module>
  import type { ImageProps } from 'layerchart';
  import type { Texture } from 'three';

  type Loaded = { texture: Texture; ready: boolean; listeners: Set<() => void> };

  /**
   * Textures loaded for images, by `crossOrigin` and URL: shared by every WebGL `Image`, so one
   * mounted again, or handed a URL another has loaded, draws it at once (as the core `Canvas`
   * layer's images are shared)
   */
  const textures = new Map<string, Loaded>();

  type Point = [number, number];

  /** `polygon` cut to the box `[x0, y0, x1, y1]` (a convex polygon stays convex) */
  function clipToBox(polygon: Point[], [x0, y0, x1, y1]: [number, number, number, number]) {
    const edges: [(p: Point) => number, number][] = [
      [(p) => p[0] - x0, 0],
      [(p) => x1 - p[0], 0],
      [(p) => p[1] - y0, 0],
      [(p) => y1 - p[1], 0],
    ];
    let out = polygon;
    for (const [inside] of edges) {
      const input = out;
      out = [];
      for (let i = 0; i < input.length; i++) {
        const a = input[i];
        const b = input[(i + 1) % input.length];
        const da = inside(a);
        const db = inside(b);
        if (da >= 0) out.push(a);
        if (da >= 0 !== db >= 0) {
          const t = da / (da - db);
          out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
        }
      }
      if (out.length < 3) return [];
    }
    return out;
  }

  /**
   * Where an image of `natural` size lies in its box as SVG's `preserveAspectRatio` places it
   * (`[x, y, width, height]`)
   */
  function fit(
    box: [number, number, number, number],
    natural: { width: number; height: number },
    preserveAspectRatio = 'xMidYMid meet'
  ): [number, number, number, number] {
    const [x, y, width, height] = box;
    const [align = 'xMidYMid', mode = 'meet'] = preserveAspectRatio.trim().split(/\s+/);
    if (align === 'none' || !natural.width || !natural.height) return box;
    const scale = (mode === 'slice' ? Math.max : Math.min)(
      width / natural.width,
      height / natural.height
    );
    const w = natural.width * scale;
    const h = natural.height * scale;
    const share = (name: string) => (name === 'Min' ? 0 : name === 'Max' ? 1 : 0.5);
    const ax = share(align.slice(1, 4));
    const ay = share(align.slice(5, 8));
    return [x + (width - w) * ax, y + (height - h) * ay, w, h];
  }
</script>

<!-- LayerChart's `Image`: each image a flat textured shape on the floor, placed as the core
     `Image` places it (`preserveAspectRatio`, its circle clip `r`, and `rotate`) -->
<script lang="ts">
  import {
    BufferGeometry,
    DoubleSide,
    Float32BufferAttribute,
    LinearFilter,
    LinearMipmapLinearFilter,
    Mesh,
    MeshBasicMaterial,
    NearestFilter,
    Quaternion,
    Vector3,
  } from 'three';
  import { ImageState } from 'layerchart/base';

  import { getSceneContext, groupOpacity } from '../../contexts/scene.svelte.js';
  import { loadTexture } from '../../utils/texture.js';

  let props: ImageProps = $props();

  const c = new ImageState(() => props);
  const scene = getSceneContext();
  const inGroup = groupOpacity();
  /** Its objects, stacked with other marks' in the order they're declared */
  const layer = scene.layer();

  /** Bumped as each image arrives, to draw it */
  let arrivals = $state(0);

  function textureOf(href: string) {
    const crossOrigin = props.crossOrigin ?? 'anonymous';
    const key = `${crossOrigin} ${href}`;
    let entry = textures.get(key);
    if (!entry) {
      const created: Loaded = { texture: null as unknown as Texture, ready: false, listeners: new Set() };
      created.texture = loadTexture(
        href,
        () => {
          created.ready = true;
          for (const listener of created.listeners) listener();
          created.listeners.clear();
        },
        { crossOrigin }
      );
      // Mipmapped with its colors weighted by their alpha, so a logo shrunk on a transparent
      // background doesn't pale with the (often white) color of its transparent pixels
      created.texture.premultiplyAlpha = true;
      textures.set(key, created);
      entry = created;
    }
    if (!entry.ready) entry.listeners.add(() => arrivals++);
    return entry;
  }

  /** A pixel-mode image's row, so the pointer picks it (its handlers are called without one) */
  const PIXEL_ROW = {};

  /** Each image where it is now: its center, size, circle clip, turn, and URL */
  const items = $derived(
    c.dataMode
      ? c.resolvedItems.map((item) => ({
          d: item.d,
          href: c.resolveHref(item.d),
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          r: item.r,
          rotate: item.rotate,
        }))
      : [
          {
            d: PIXEL_ROW,
            href: typeof props.href === 'string' ? props.href : undefined,
            x: c.motionX,
            y: c.motionY,
            width: c.motionWidth,
            height: c.motionHeight,
            r: c.pixelR,
            rotate: c.pixelRotate,
          },
        ]
  );

  /** An image's height off the floor, by its `z` (in a 3D view) */
  function heightOf(d: any) {
    const z = props.z;
    if (z == null) return 0;
    if (typeof z === 'number') return z;
    return d === PIXEL_ROW ? 0 : c.chartCtx.heightOf(d, z)[1];
  }

  const handled = $derived(
    !!(
      props.onclick ||
      props.onpointerenter ||
      props.onpointermove ||
      props.onpointerleave ||
      props.onpointerdown
    )
  );

  /** One mesh for each URL's images, so thousands of images cost a draw call for each URL */
  const meshes = new Map<
    string,
    { mesh: Mesh<BufferGeometry, MeshBasicMaterial>; rows: any[]; removePickable?: () => void }
  >();

  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    arrivals;
    const list = items;
    const crisp = props.imageRendering === 'pixelated' || props.imageRendering === 'crisp-edges';
    const alpha = (props.opacity ?? 1) * inGroup();
    const byHref = new Map<string, { positions: number[]; uvs: number[]; rows: any[] }>();
    // In a 3D view, the camera's right and up, for each image to face it
    let billboard: [Vector3, Vector3] | null = null;
    if (c.chartCtx.view && scene.camera) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      scene.cameraVersion;
      const turn = scene.camera.getWorldQuaternion(new Quaternion());
      billboard = [new Vector3(1, 0, 0).applyQuaternion(turn), new Vector3(0, 1, 0).applyQuaternion(turn)];
    }

    list.forEach((item, i) => {
      if (!item.href || !(item.width > 0) || !(item.height > 0)) return;
      const entry = textureOf(item.href);
      if (!entry.ready) return;
      const image = entry.texture.image as { naturalWidth?: number; width: number; naturalHeight?: number; height: number };
      const natural = {
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      };
      const box: [number, number, number, number] = [
        item.x - item.width / 2,
        item.y - item.height / 2,
        item.width,
        item.height,
      ];
      const [ix, iy, iw, ih] = fit(box, natural, props.preserveAspectRatio);
      // What shows: the box (or its circle) where the image covers it
      let outline: Point[];
      if (item.r !== undefined) {
        const segments = 64;
        outline = Array.from({ length: segments }, (_, k) => {
          const angle = (k / segments) * Math.PI * 2;
          return [item.x + item.r! * Math.cos(angle), item.y + item.r! * Math.sin(angle)] as Point;
        });
      } else {
        outline = [
          [box[0], box[1]],
          [box[0] + box[2], box[1]],
          [box[0] + box[2], box[1] + box[3]],
          [box[0], box[1] + box[3]],
        ];
      }
      const shown = clipToBox(
        clipToBox(outline, [box[0], box[1], box[0] + box[2], box[1] + box[3]]),
        [ix, iy, ix + iw, iy + ih]
      );
      if (shown.length < 3) return;

      const turn = ((item.rotate ?? 0) * Math.PI) / 180;
      const [cos, sin] = [Math.cos(turn), Math.sin(turn)];
      // Later images over earlier ones, as SVG paints them (in a 3D view, by depth)
      const lift = heightOf(item.d) + (billboard ? 0 : (i / Math.max(1, list.length)) * 1.5);
      let group = byHref.get(item.href);
      if (!group) byHref.set(item.href, (group = { positions: [], uvs: [], rows: [] }));
      const vertex = ([px, py]: Point) => {
        const dx = px - item.x;
        const dy = py - item.y;
        // Turned clockwise on the screen (`y` down), about its center
        const across = dx * cos - dy * sin;
        const down = dx * sin + dy * cos;
        if (billboard) {
          // Upright, facing the camera, as the core `Image` stands on an isometric chart
          const [r, u] = billboard;
          group!.positions.push(
            item.x + r.x * across - u.x * down,
            lift + r.y * across - u.y * down,
            item.y + r.z * across - u.z * down
          );
        } else {
          group!.positions.push(item.x + across, lift, item.y + down);
        }
        group!.uvs.push((px - ix) / iw, 1 - (py - iy) / ih);
      };
      for (let k = 1; k + 1 < shown.length; k++) {
        vertex(shown[0]);
        vertex(shown[k]);
        vertex(shown[k + 1]);
        group.rows.push(item.d);
      }
    });

    for (const [href, entry] of meshes) {
      if (byHref.has(href)) continue;
      entry.removePickable?.();
      layer.remove(entry.mesh);
      entry.mesh.geometry.dispose();
      entry.mesh.material.dispose();
      meshes.delete(href);
    }
    for (const [href, group] of byHref) {
      let entry = meshes.get(href);
      if (!entry) {
        const texture = textureOf(href).texture;
        const material = new MeshBasicMaterial({
          map: texture,
          side: DoubleSide,
          transparent: true,
          premultipliedAlpha: true,
        });
        const mesh = new Mesh(new BufferGeometry(), material);
        layer.add(mesh);
        entry = { mesh, rows: [] };
        meshes.set(href, entry);
      }
      const texture = entry.mesh.material.map!;
      const magFilter = crisp ? NearestFilter : LinearFilter;
      const minFilter = crisp ? NearestFilter : LinearMipmapLinearFilter;
      if (texture.magFilter !== magFilter || texture.minFilter !== minFilter) {
        texture.magFilter = magFilter;
        texture.minFilter = minFilter;
        texture.needsUpdate = true;
      }
      entry.mesh.material.opacity = alpha;
      // Standing in a 3D view, its transparent pixels mustn't hide what's behind them
      const alphaTest = billboard ? 0.05 : 0;
      if (entry.mesh.material.alphaTest !== alphaTest) {
        entry.mesh.material.alphaTest = alphaTest;
        entry.mesh.material.needsUpdate = true;
      }
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new Float32BufferAttribute(group.positions, 3));
      geometry.setAttribute('uv', new Float32BufferAttribute(group.uvs, 2));
      entry.mesh.geometry.dispose();
      entry.mesh.geometry = geometry;
      entry.rows = group.rows;
      // Picked only for its pointer handlers (the core `Image` shows no tooltip of its own)
      if (handled && !entry.removePickable) {
        const picked = entry;
        entry.removePickable = scene.addPickable({
          object: entry.mesh,
          tooltip: () => false,
          datum: (hit) => (hit.faceIndex == null ? undefined : picked.rows[hit.faceIndex]),
          events: () => {
            const call =
              <E extends Event>(handler: ((e: any) => void) | null | undefined) =>
              (e: E) =>
                handler?.(e);
            return {
              onclick: props.onclick && call(props.onclick),
              onpointerenter: props.onpointerenter && call(props.onpointerenter),
              onpointermove: props.onpointermove && call(props.onpointermove),
              onpointerleave: props.onpointerleave && call(props.onpointerleave),
            };
          },
        });
      } else if (!handled && entry.removePickable) {
        entry.removePickable();
        entry.removePickable = undefined;
      }
    }
    scene.invalidate();
  });

  $effect(() => () => {
    for (const entry of meshes.values()) {
      entry.removePickable?.();
      layer.remove(entry.mesh);
      entry.mesh.geometry.dispose();
      entry.mesh.material.dispose();
    }
    meshes.clear();
  });
</script>
