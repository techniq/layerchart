<script lang="ts" module>
  import type { ImageSource } from '../../utils/texture.js';
  import type { PointsProps } from './Points.shared.svelte.js';
</script>

<script lang="ts">
  import {
    CircleGeometry,
    IcosahedronGeometry,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    Quaternion,
    SphereGeometry,
    Vector3,
    type Texture,
  } from 'three';
  import { untrack } from 'svelte';
  import { getChartContext, isScaleLinear } from 'layerchart';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { createInstances, ringGeometry } from '../../utils/instances.svelte.js';
  import { loadTexture } from '../../utils/texture.js';
  import { fieldOrValueOf, isUrl, valueOf } from '../../utils/values.js';
  import { getSphere } from '../../utils/globe.js';
  import { colorer, defined, linearShift, placer, resolveAccessor } from '../../utils/marks.js';

  let {
    data: dataProp,
    x,
    y,
    z,
    r,
    fill,
    stroke,
    strokeWidth: strokeWidthProp,
    class: className,
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
  /** Its objects, stacked with other marks' in the order they're declared */
  const layer = scene.layer();
  /** What its `class` sets */
  const look = $derived(scene.style(className));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);
  /** Ringed only when asked, and flat: a 3D view's points are lit spheres */
  const ringed = $derived(!ctx.view && (stroke != null || !!look?.stroke) && strokeWidth > 0);

  ctx.registerComponent({
    name: 'Points',
    kind: 'mark',
    markInfo: () => ({ data: dataProp, x, y, color: typeof fill === 'string' ? fill : undefined }),
  });

  const rows = $derived((dataProp ?? ctx.data ?? []) as any[]);
  const sphere = $derived(getSphere(ctx));
  const xAccessor = $derived(resolveAccessor(x, ctx.config.x));
  const yAccessor = $derived(resolveAccessor(y, ctx.config.y));

  /**
   * Panning and zooming a linear `domain` moves every row's pixels by one scale and offset an
   * axis, so while it moves the GPU moves the rows, and they're placed again once it rests (for
   * picking the right one): a great many rows pan and zoom as fast as a few
   */
  const shiftable = $derived(
    ctx.transform.mode === 'domain' &&
      !sphere &&
      !ctx.geo.projection &&
      image == null &&
      isScaleLinear(ctx.xScale) &&
      isScaleLinear(ctx.yScale)
  );
  /** The scales rows were last placed through, while they can be shifted */
  let placedScales = $state.raw<{ x: any; y: any } | null>(null);
  $effect(() => {
    const scales = { x: ctx.xScale, y: ctx.yScale };
    if (!shiftable) {
      placedScales = null;
      return;
    }
    if (!untrack(() => placedScales)) {
      placedScales = scales;
      return;
    }
    const timer = setTimeout(() => (placedScales = scales), 150);
    return () => clearTimeout(timer);
  });
  const shift = $derived.by((): [number, number, number, number] | null => {
    if (!placedScales) return null;
    const shift = [
      ...linearShift(placedScales.x, ctx.xScale),
      ...linearShift(placedScales.y, ctx.yScale),
    ] as [number, number, number, number];
    // Placed where they're drawn (at rest): none
    const [kx, tx, ky, ty] = shift;
    return kx === 1 && tx === 0 && ky === 1 && ty === 0 ? null : shift;
  });

  /**
   * Where each row's sphere is in the scene and how large (`null` off the chart), with what it
   * reads of the chart read once: there can be a great many rows
   */
  function pointer() {
    const [xOf, yOf] = [xAccessor, yAccessor];
    const at = placer(ctx, sphere, placedScales ?? undefined);
    const raised = ctx.config.z != null || z != null;
    const sized = r != null ? (d: any) => valueOf(r, d) : ctx.config.r ? ctx.rGet : () => 5;
    return (d: any) => {
      const xValue = xOf(d);
      const yValue = yOf(d);
      if (!defined(xValue) || !defined(yValue)) return null;
      const [px, up, py] = at(xValue, yValue, raised ? ctx.heightOf(d, z)[1] : 0);
      return { d, x: px, y: py, z: up, radius: sized(d) as number };
    };
  }

  const imageOf = (d: any) => (image == null ? null : (fieldOrValueOf(image, d, isUrl) ?? null));

  // A unit sphere, scaled out to each point's radius about its center.  Flat (no `view`, seen
  // from directly above) a disc facing up looks the same, for a fraction of the triangles.
  const ball = new SphereGeometry(1, 24, 16);
  const disc = new CircleGeometry(1, 24).rotateX(-Math.PI / 2);
  // Glowing, a point is unlit, one color all over: only its outline shows, so a tenth of the
  // triangles look the same (and hundreds of thousands of stars stay quick)
  const star = new IcosahedronGeometry(1, 1);
  createInstances({
    tooltip: () => tooltip,
    glow: () => glow,
    // A class blending light in (ex. `mix-blend-plus-lighter`), as in an `Svg` layer
    additive: () => look?.blend === 'plus-lighter' || look?.blend === 'screen',
    geometry: () => (ctx.view ? (glow ? star : ball) : disc),
    instances: () => {
      const pointOf = pointer();
      const colorOf = colorer(ctx, fill, 'var(--color-primary, currentColor)', look?.fill);
      return rows.flatMap((d: any) => {
        if (image != null && imageOf(d)) return [];
        const point = pointOf(d);
        if (!point) return [];
        // Inside its ring, so the two don't overlap (and darken where they're translucent)
        const radius = ringed ? Math.max(0, point.radius - strokeWidth / 2) : point.radius;
        return [
          {
            d,
            x: point.x,
            y: point.y,
            z: point.z,
            width: radius,
            depth: radius,
            height: radius,
            color: colorOf(d),
          },
        ];
      });
    },
    opacity: () => opacity * (look?.opacity ?? 1),
    shift: () => shift,
    emphasize: (_color, size) => size.multiplyScalar(hoverScale),
  });

  // Each point's ring, half its width either side of its edge, as an SVG circle's stroke
  createInstances({
    geometry: ringGeometry(),
    ring: () => (strokeWidth / 2) * scene.unit,
    instances: () => {
      if (!ringed) return [];
      const pointOf = pointer();
      const colorOf = colorer(ctx, stroke, 'currentColor', look?.stroke);
      return rows.flatMap((d: any) => {
        if (image != null && imageOf(d)) return [];
        const point = pointOf(d);
        if (!point) return [];
        return [
          {
            d,
            x: point.x,
            y: point.y,
            // Over its point, flat
            z: point.z + 0.01,
            width: point.radius,
            depth: point.radius,
            height: point.radius,
            color: colorOf(d),
          },
        ];
      });
    },
    opacity: () => opacity * (look?.opacity ?? 1),
    shift: () => shift,
    emphasize: (_color, size) => size.multiplyScalar(hoverScale),
  });

  // Rows wrapped in an image: a sphere each, from a pool reused as they move (ex. orbiting)
  const textured = $derived.by(() => {
    if (image == null) return [];
    const pointOf = pointer();
    return rows.flatMap((d) => {
      const source = imageOf(d);
      const point = source ? pointOf(d) : null;
      return point ? [{ ...point, source: source! }] : [];
    });
  });
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
        layer.add(mesh);
        const picked = mesh;
        removePickables.push(
          scene.addPickable({
            object: picked,
            datum: () => (tooltip ? picked.userData.d : undefined),
          })
        );
      }
      const material = materialFor(point.source, !glow);
      material.opacity = opacity * (look?.opacity ?? 1);
      material.transparent = material.opacity < 1;
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
      for (const mesh of pool) layer.remove(mesh);
      detailed.dispose();
      for (const material of materials.values()) material.dispose();
      for (const texture of textures.values()) texture.dispose();
      scene.invalidate();
    };
  });
</script>
