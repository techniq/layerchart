<script lang="ts" module>
  import type { ImageSource } from '../../utils/texture.js';
  import type { PointsProps } from './Points.shared.svelte.js';
</script>

<!-- The points of `Points`, drawn (as `children` aren't given) -->
<script lang="ts">
  import { getMarkData } from 'layerchart/base';
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
  import { accessor, getChartContext, isScaleLinear } from 'layerchart';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { createInstances, ringGeometry, scaledDash } from '../../utils/instances.svelte.js';
  import { dashPattern } from '../../utils/merged.svelte.js';
  import { loadTexture } from '../../utils/texture.js';
  import { fieldOrValueOf, isUrl, valueOf } from '../../utils/values.js';
  import { getSphere } from '../../utils/globe.js';
  import { colorer, defined, linearShift, placer, resolveAccessor } from '../../utils/marks.js';
  import { createRowMotion } from '../../utils/rowMotion.svelte.js';

  let {
    data: dataProp,
    x,
    y,
    seriesKey,
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
    offsetX,
    offsetY,
    fillOpacity = 1,
    strokeOpacity = 1,
    dashArray,
    initialCx,
    initialCy,
    initialR,
    key = (_d: any, i: number) => i,
    motion,
    viewport = false,
  }: PointsProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** Its objects, stacked with other marks' in the order they're declared */
  const layer = scene.layer();
  /** What its `class` sets */
  const look = $derived(scene.style(className));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);
  /**
   * Discs lying flat (each a circle on the floor, at its height): on a flat chart, and on an
   * `isometric` one unless `viewport` turns them to the viewer, as the core `Points` lie there.
   * Otherwise (a 3D view, or `viewport`) lit spheres, round from any side.
   */
  const flat = $derived(!ctx.view || (ctx.view.type === 'isometric' && !viewport));
  /** Ringed only when asked, and flat */
  const ringed = $derived(flat && (stroke != null || !!look?.stroke) && strokeWidth > 0);

  ctx.registerComponent({
    name: 'Points',
    kind: 'mark',
    markInfo: () => ({
      data: dataProp,
      x,
      y,
      seriesKey,
      color: typeof fill === 'string' ? fill : undefined,
    }),
  });

  /**
   * The series it draws, as the core `Points`: its rows, value, and color.  Looked up only with a
   * `seriesKey`, so points without one don't read the series state.
   */
  const series = $derived(
    seriesKey == null ? undefined : ctx.series.series.find((s) => s.key === seriesKey)
  );
  const seriesAccessor = $derived(
    seriesKey == null ? undefined : ctx.series.valueAccessor(seriesKey)
  );
  /** Faded while another series is highlighted, as that series' other marks are */
  const seriesOpacity = $derived(
    series == null ||
      ctx.series.visibleSeries.length <= 1 ||
      ctx.series.isHighlighted(series.key, true)
      ? 1
      : 0.1
  );
  /** At the top of its stack, as the core `Points`, when the chart stacks its series */
  const stack = $derived(ctx.stackAccessorsFor({ seriesKey, ownData: dataProp != null }));

  /** Its rows: its own `data`, else its series' or the chart's, narrowed to its facet panel */
  const markData = getMarkData();
  const rows = $derived(markData(dataProp, series?.data) as any[]);
  const sphere = $derived(getSphere(ctx));
  const xAccessor = $derived(
    resolveAccessor(x ?? (ctx.valueAxis === 'x' ? seriesAccessor : undefined), ctx.config.x)
  );
  const yAccessor = $derived.by(() => {
    if (y != null) return accessor(y);
    if (stack) return stack.y1;
    // A series' `[start, end]` value, at its end
    if (Array.isArray(seriesAccessor) && ctx.valueAxis === 'y') return accessor(seriesAccessor[1]);
    return resolveAccessor(ctx.valueAxis === 'y' ? seriesAccessor : undefined, ctx.config.y);
  });
  /** Its fill without one of its own: its class's, else its series' (as core's), else `c`'s */
  const fillValue = $derived(fill ?? (look?.fill ? undefined : series?.color));

  // Easing to where they're asked to be, as core's points (a `Circle` each), each by its `key`, a
  // new one from `initialCx` / `initialCy` / `initialR` where they're given
  const motionMap = createRowMotion(
    untrack(() => motion),
    ['cx', 'cy', 'r'] as const
  );
  const initial = $derived({ cx: initialCx, cy: initialCy, r: initialR });

  /**
   * Panning and zooming a linear `domain` moves every row's pixels by one scale and offset an
   * axis, so while it moves the GPU moves the rows, and they're placed again once it rests (for
   * picking the right one): a great many rows pan and zoom as fast as a few
   */
  const shiftable = $derived(
    // Easing points are placed afresh as they move
    !motionMap &&
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

  if (motionMap) {
    $effect(() => {
      const pointOf = placed();
      const from = initial;
      const active = new Set<unknown>();
      rows.forEach((d, i) => {
        const points = pointOf(d);
        points.forEach((point, j) => {
          const k = keyOf(key(d, i), j, points.length);
          active.add(k);
          const values = { cx: point.x, cy: point.y, r: point.radius };
          untrack(() => motionMap.update(k, values, from));
        });
      });
      untrack(() => motionMap.cleanup(active));
    });
  }

  /** A row's point's motion key: the row's own, or with one per value, the row's and which */
  const keyOf = (k: unknown, j: number, count: number) => (count > 1 ? `${String(k)}:${j}` : k);

  /**
   * Where each row's spheres are now (none off the chart): where they're asked to be, or with
   * `motion`, on their way there (a new one where it eases in from, until it starts)
   */
  function pointer(): (d: any, i: number) => ReturnType<ReturnType<typeof placed>> {
    const pointOf = placed();
    if (!motionMap) return pointOf;
    return (d, i) => {
      const points = pointOf(d);
      return points.map((point, j) => {
        const now = motionMap.get(keyOf(key(d, i), j, points.length)) ?? initial;
        return {
          ...point,
          x: now.cx ?? point.x,
          y: now.cy ?? point.y,
          radius: now.r ?? point.radius,
        };
      });
    };
  }

  /**
   * Where each row's spheres are asked to be in the scene and how large (none off the chart): one,
   * or as the core `Points`, one per value of an `x` or `y` of several (ex. a duration's start and
   * end).  With what it reads of the chart read once: there can be a great many rows.
   */
  function placed() {
    const [xOf, yOf] = [xAccessor, yAccessor];
    const at = placer(ctx, sphere, placedScales ?? undefined, { x: offsetX, y: offsetY });
    const raised = ctx.config.z != null || z != null;
    const sized = r != null ? (d: any) => valueOf(r, d) : ctx.config.r ? ctx.rGet : () => 5;
    type Point = { d: any; x: number; y: number; z: number; radius: number };
    const one = (d: any, xValue: any, yValue: any): Point[] => {
      if (!defined(xValue) || !defined(yValue)) return [];
      const [px, up, py] = at(xValue, yValue, raised ? ctx.heightOf(d, z)[1] : 0);
      return [{ d, x: px, y: py, z: up, radius: sized(d) as number }];
    };
    return (d: any): Point[] => {
      const xValue = xOf(d);
      const yValue = yOf(d);
      if (Array.isArray(xValue)) return xValue.filter(Boolean).flatMap((v) => one(d, v, yValue));
      if (Array.isArray(yValue)) return yValue.filter(Boolean).flatMap((v) => one(d, xValue, v));
      return one(d, xValue, yValue);
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
    geometry: () => (flat ? disc : glow ? star : ball),
    instances: () => {
      const pointOf = pointer();
      const colorOf = colorer(ctx, fillValue, 'var(--color-primary, currentColor)', look?.fill);
      return rows.flatMap((d: any, i: number) => {
        if (image != null && imageOf(d)) return [];
        return pointOf(d, i).map((point) => {
          // Inside its ring, so the two don't overlap (and darken where they're translucent)
          const radius = ringed ? Math.max(0, point.radius - strokeWidth / 2) : point.radius;
          return {
            d,
            x: point.x,
            y: point.y,
            z: point.z,
            width: radius,
            depth: radius,
            height: radius,
            color: colorOf(d),
          };
        });
      });
    },
    opacity: () => opacity * fillOpacity * seriesOpacity * (look?.opacity ?? 1),
    shift: () => shift,
    emphasize: (_color, size) => size.multiplyScalar(hoverScale),
  });

  // Each point's ring, half its width either side of its edge, as an SVG circle's stroke
  createInstances({
    geometry: ringGeometry(),
    ring: () => (strokeWidth / 2) * scene.unit,
    dash: () => scaledDash(dashPattern(dashArray), scene.unit),
    instances: () => {
      if (!ringed) return [];
      const pointOf = pointer();
      const colorOf = colorer(ctx, stroke, 'currentColor', look?.stroke);
      return rows.flatMap((d: any, i: number) => {
        if (image != null && imageOf(d)) return [];
        return pointOf(d, i).map((point) => ({
          d,
          x: point.x,
          y: point.y,
          // Over its point, flat
          z: point.z + 0.01,
          width: point.radius,
          depth: point.radius,
          height: point.radius,
          color: colorOf(d),
        }));
      });
    },
    opacity: () => opacity * strokeOpacity * seriesOpacity * (look?.opacity ?? 1),
    shift: () => shift,
    emphasize: (_color, size) => size.multiplyScalar(hoverScale),
  });

  // Rows wrapped in an image: a sphere each, from a pool reused as they move (ex. orbiting)
  const textured = $derived.by(() => {
    if (image == null) return [];
    const pointOf = pointer();
    return rows.flatMap((d, i) => {
      const source = imageOf(d);
      return source ? pointOf(d, i).map((point) => ({ ...point, source })) : [];
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
      material.opacity = opacity * fillOpacity * seriesOpacity * (look?.opacity ?? 1);
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
