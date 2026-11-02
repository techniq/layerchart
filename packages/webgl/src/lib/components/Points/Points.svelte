<script lang="ts" module>
  import type { Accessor, ColorProp, DataProp } from 'layerchart';
  import type { ImageSource } from '../../utils/texture.js';
  import type { ValueProp } from '../../utils/values.js';

  export type PointsProps = {
    /** Override the chart's `data` */
    data?: any[];
    /** Override the chart's `x` accessor */
    x?: Accessor;
    /** Override the chart's `y` accessor */
    y?: Accessor;
    /**
     * Height off the floor: a data key or function (through the chart's `z` scale), or a number
     * of pixels.  Defaults to the chart's `z`.
     */
    z?: DataProp;
    /**
     * Radius in pixels, or per row.  Defaults to the chart's `r` scale when it has one, else `5`.
     */
    r?: number | ((d: any) => number);
    /**
     * A CSS color, or a data key / function run through the chart's color scale.  Defaults to the
     * chart's `c`, else `var(--color-primary, currentColor)`.
     */
    fill?: ColorProp;
    /** @default 1 */
    opacity?: number;
    /**
     * Scale of the hovered point.
     *
     * @default 1.4
     */
    hoverScale?: number;
    /**
     * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).
     *
     * @default false
     */
    tooltip?: boolean;
    /**
     * Draw each sphere in its own color (or image), whatever the lights: ex. a star, lighting the
     * rest with a `Light type="point"` inside it.
     *
     * @default false
     */
    glow?: boolean;
    /**
     * An equirectangular image to wrap each sphere in, or a function of the row returning one (ex.
     * a planet's surface): a URL, or an image or canvas already drawn.  Rows without one are
     * colored by `fill`.
     */
    image?: ValueProp<ImageSource | null | undefined>;
    /**
     * Degrees to turn an image-wrapped sphere about its axis (ex. a planet's spin), or per row.
     *
     * @default 0
     */
    rotate?: ValueProp<number>;
    /**
     * Degrees an image-wrapped sphere's axis leans from upright (ex. `23.4` for the Earth), or per
     * row.
     *
     * @default 0
     */
    tilt?: ValueProp<number>;
  };
</script>

<script lang="ts">
  import {
    CircleGeometry,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    Quaternion,
    SphereGeometry,
    Vector3,
    type Texture,
  } from 'three';
  import { getChartContext } from 'layerchart';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { createInstances } from '../../utils/instances.svelte.js';
  import { loadTexture } from '../../utils/texture.js';
  import { valueOf } from '../../utils/values.js';
  import { getSphere } from '../../utils/globe.js';
  import { defined, place, resolveAccessor, rowColor } from '../../utils/marks.js';

  let {
    data: dataProp,
    x,
    y,
    z,
    r,
    fill,
    opacity = 1,
    hoverScale = 1.4,
    tooltip = false,
    glow = false,
    image,
    rotate = 0,
    tilt = 0,
  }: PointsProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();

  ctx.registerComponent({
    name: 'Points',
    kind: 'mark',
    markInfo: () => ({ data: dataProp, x, y, color: typeof fill === 'string' ? fill : undefined }),
  });

  const rows = $derived((dataProp ?? ctx.data ?? []) as any[]);
  const sphere = $derived(getSphere(ctx));
  const xAccessor = $derived(resolveAccessor(x, ctx.config.x));
  const yAccessor = $derived(resolveAccessor(y, ctx.config.y));

  /** Where a row's sphere is in the scene, how large, and its color; `null` off the chart */
  function pointOf(d: any) {
    const xValue = xAccessor(d);
    const yValue = yAccessor(d);
    if (!defined(xValue) || !defined(yValue)) return null;
    const height = ctx.config.z != null || z != null ? ctx.heightOf(d, z)[1] : 0;
    const [px, up, py] = place(ctx, sphere, xValue, yValue, height);
    const radius = typeof r === 'function' ? r(d) : (r ?? (ctx.config.r ? ctx.rGet(d) : 5));
    return { d, x: px, y: py, z: up, radius };
  }

  const imageOf = (d: any) => (image == null ? null : valueOf(image, d));

  // A unit sphere, scaled out to each point's radius about its center.  Flat (no `view`, seen
  // from directly above) a disc facing up looks the same, for a fraction of the triangles.
  const ball = new SphereGeometry(1, 24, 16);
  const disc = new CircleGeometry(1, 24).rotateX(-Math.PI / 2);
  createInstances({
    tooltip: () => tooltip,
    glow: () => glow,
    geometry: () => (ctx.view ? ball : disc),
    instances: () =>
      rows.flatMap((d: any) => {
        if (imageOf(d)) return [];
        const point = pointOf(d);
        if (!point) return [];
        return [
          {
            d,
            x: point.x,
            y: point.y,
            z: point.z,
            width: point.radius,
            depth: point.radius,
            height: point.radius,
            color: rowColor(ctx, fill, d, 'var(--color-primary, currentColor)'),
          },
        ];
      }),
    opacity: () => opacity,
    emphasize: (_color, size) => size.multiplyScalar(hoverScale),
  });

  // Rows wrapped in an image: a sphere each, from a pool reused as they move (ex. orbiting)
  const textured = $derived(
    image == null
      ? []
      : rows.flatMap((d) => {
          const source = imageOf(d);
          const point = source ? pointOf(d) : null;
          return point ? [{ ...point, source: source! }] : [];
        })
  );
  const detailed = new SphereGeometry(1, 64, 32);
  const pool: Mesh[] = [];
  const textures = new Map<unknown, Texture>();
  const materials = new Map<string, MeshLambertMaterial | MeshBasicMaterial>();
  const removePickables: (() => void)[] = [];
  const axisUp = new Vector3(0, 1, 0);
  const axisLean = new Vector3(0, 0, 1);
  const spin = new Quaternion();

  /** The material for an image, lit or glowing */
  function materialFor(source: ImageSource, lit: boolean) {
    let texture = textures.get(source);
    if (!texture) {
      texture = loadTexture(source, () => scene.invalidate());
      textures.set(source, texture);
    }
    const key = `${lit}:${texture.uuid}`;
    let material = materials.get(key);
    if (!material) {
      material = lit
        ? new MeshLambertMaterial({ map: texture })
        : new MeshBasicMaterial({ map: texture });
      materials.set(key, material);
    }
    return material;
  }

  $effect(() => {
    const list = textured;
    list.forEach((point, i) => {
      let mesh = pool[i];
      if (!mesh) {
        mesh = pool[i] = new Mesh(detailed);
        scene.root.add(mesh);
        const picked = mesh;
        removePickables.push(
          scene.addPickable({
            object: picked,
            datum: () => (tooltip ? picked.userData.d : undefined),
          })
        );
      }
      const material = materialFor(point.source, !glow);
      material.opacity = opacity;
      material.transparent = opacity < 1;
      mesh.material = material;
      mesh.castShadow = mesh.receiveShadow = !glow;
      mesh.visible = true;
      mesh.userData.d = point.d;
      mesh.position.set(point.x, point.z, point.y);
      mesh.scale.setScalar(Math.max(point.radius, 1e-6));
      // Leaning, then turned about the leaning axis
      mesh.quaternion
        .setFromAxisAngle(axisLean, (-valueOf(tilt, point.d) * Math.PI) / 180)
        .multiply(spin.setFromAxisAngle(axisUp, (valueOf(rotate, point.d) * Math.PI) / 180));
    });
    for (let i = list.length; i < pool.length; i++) {
      pool[i].visible = false;
      pool[i].userData.d = undefined;
      pool[i].scale.setScalar(1e-6);
    }
    scene.invalidate();
  });

  $effect(() => {
    return () => {
      for (const remove of removePickables) remove();
      for (const mesh of pool) scene.root.remove(mesh);
      detailed.dispose();
      for (const material of materials.values()) material.dispose();
      for (const texture of textures.values()) texture.dispose();
      scene.invalidate();
    };
  });
</script>
