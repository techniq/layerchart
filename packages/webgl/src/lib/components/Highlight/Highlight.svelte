<script lang="ts" module>
  import type { Accessor } from 'layerchart';
  import type { MotionProp } from 'layerchart/utils/motion.svelte';

  /** How a `Highlight`'s point is drawn, as LayerChart's `Circle` props */
  export type HighlightPointProps = {
    /** Radius in pixels on screen. @default 4 */
    r?: number;
    /** Defaults to the row's color (the chart's `c`), else the primary color */
    fill?: string;
    /** @default 'white' */
    stroke?: string;
    /** Defaults to `2` with an `r`, else `6` */
    strokeWidth?: number;
    opacity?: number;
    class?: string;
  };

  /** How a `Highlight`'s lines are drawn, as LayerChart's `Line` props */
  export type HighlightLineProps = {
    /** @default 'color-mix(in oklab, var(--color-surface-content) 20%, transparent)' */
    stroke?: string;
    /** Width in pixels, the same at any depth. @default 2 */
    strokeWidth?: number;
    opacity?: number;
    /** CSS classes to style them by (their stroke, width, and opacity) */
    class?: string;
  };

  /** How a `Highlight`'s shadows are drawn */
  export type HighlightShadowProps = {
    /** Radius in pixels, as the view is fitted. @default 6 */
    r?: number;
    /** @default 'color-mix(in oklab, var(--color-surface-content) 20%, transparent)' */
    fill?: string;
    opacity?: number;
    /** CSS classes to style them by (their fill and opacity) */
    class?: string;
  };

  export type HighlightProps = {
    /** The row to highlight.  Defaults to the tooltip's. */
    data?: any;
    /** Override `x` from context */
    x?: Accessor;
    /** Override `y` from context */
    y?: Accessor;
    /**
     * Override `z` from context: the point floats at the row's height.  `z={() => 0}` puts it on
     * the floor beneath instead.
     */
    z?: Accessor;
    /**
     * Use the chart's radius scale for the point's size: `true` for the chart's `r`, or an accessor
     * for the value to scale
     */
    r?: boolean | Accessor;
    /**
     * Which of the row's positions the lines trace: across the floor at its `x`, `y`, or both, and
     * up the back wall along that axis
     */
    axis?: 'x' | 'y' | 'both' | 'none';
    /**
     * Mark the row with a point facing the viewer, and how it's drawn.
     * @default false
     */
    points?: boolean | HighlightPointProps;
    /**
     * Trace the row's position on the floor and, with a `z`, each back wall: across it at the row's
     * height, and up it at the row's `x` or `y` (with `axis`).
     * @default false
     */
    lines?: boolean | HighlightLineProps;
    /**
     * With a `z`, a spot beneath the row on the floor and level with it on each back wall.
     * @default false
     */
    shadows?: boolean | HighlightShadowProps;
    /** The opacity of all of it (0 to 1) */
    opacity?: number;
    /**
     * `'spring'` to glide from one highlighted row to the next (as LayerChart's `Highlight`), or
     * `'none'`.  It follows each step of a pan or zoom at once, rather than chasing it.
     * @default 'spring'
     */
    motion?: MotionProp;
  };
</script>

<script lang="ts">
  import {
    CircleGeometry,
    Color,
    DoubleSide,
    Group,
    Mesh,
    MeshBasicMaterial,
    type BufferGeometry,
  } from 'three';
  import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
  import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
  import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
  import { untrack } from 'svelte';
  import { accessor, getChartContext, isScaleBand } from 'layerchart';
  import { createMotion } from 'layerchart/utils/motion.svelte';

  import { getSceneContext, type SceneMarker } from '../../contexts/scene.svelte.js';
  import { position, rowColor } from '../../utils/marks.js';

  let {
    data,
    x,
    y,
    z,
    r,
    axis: axisProp,
    points = false,
    lines = false,
    shadows = false,
    opacity = 1,
    motion: motionProp,
  }: HighlightProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();

  const faint = 'color-mix(in oklab, var(--color-surface-content, currentColor) 20%, transparent)';
  const pointLook = $derived(typeof points === 'object' ? points : {});
  const lineLook = $derived(typeof lines === 'object' ? lines : {});
  const shadowLook = $derived(typeof shadows === 'object' ? shadows : {});
  const lineClassed = $derived(scene.style(lineLook.class));
  const shadowClassed = $derived(scene.style(shadowLook.class));

  const row = $derived(data ?? ctx.tooltip.data);

  /** Which positions the lines trace, as LayerChart's `Highlight` picks by default */
  const axis = $derived(axisProp ?? (isScaleBand(ctx.yScale) || ctx.valueAxis === 'x' ? 'y' : 'x'));

  /** The row in the chart's pixels: across, down, and up off the floor */
  const target = $derived.by(() => {
    if (row == null) return null;
    const [px, py] = position(ctx, accessor(x ?? ctx.x)(row), accessor(y ?? ctx.y)(row));
    if (!Number.isFinite(px) || !Number.isFinite(py)) return null;
    const height =
      z != null
        ? ctx.heightOf(row, accessor(z))[1]
        : ctx.config.z != null
          ? ctx.heightOf(row)[1]
          : 0;
    return { x: px, y: py, z: height };
  });

  // Gliding from one row to the next (fixed when it mounts, as LayerChart's marks' motion is)
  const motion = untrack(() => motionProp ?? 'spring');
  let last: [number, number, number] = [0, 0, 0];
  const glide = createMotion<[number, number, number]>(
    [0, 0, 0],
    () => (target ? (last = [target.x, target.y, target.z]) : last),
    motion === 'none' ? undefined : (motion as any)
  );
  // Appearing, it's there at once rather than gliding in from the last row it showed, and so it
  // is as the scales change (ex. each step of a pan or zoom): it glides only from row to row
  let shown = false;
  let scales = '';
  $effect.pre(() => {
    const now = target;
    // What the scales do, rather than which objects they are (they can be made again the same)
    const next = JSON.stringify(
      [ctx.xScale, ctx.yScale, ctx.zScale].map((scale) => [scale.domain(), scale.range()])
    );
    const moved = next !== scales;
    scales = next;
    if (now && (!shown || moved)) glide.set([now.x, now.y, now.z], { instant: true } as any);
    shown = now != null;
  });
  /** Where the row is drawn: gliding there, while there's one */
  const at = $derived(
    target ? { x: glide.current[0], y: glide.current[1], z: glide.current[2] } : null
  );

  /** The back walls' sides of the plot box, away from the camera, and how tall they stand */
  const walls = $derived({
    x: scene.far.x === 'min' ? 0 : ctx.width,
    y: scene.far.y === 'min' ? 0 : ctx.height,
    depth: ctx.zDepth,
    // Off the walls and floor a little, towards the inside, so the grid doesn't cover them
    inX: scene.far.x === 'min' ? 0.3 : -0.3,
    inY: scene.far.y === 'min' ? 0.3 : -0.3,
  });
  const raised = $derived(!!ctx.view && walls.depth > 0 && (z != null || ctx.config.z != null));

  // Lines: dashed, as LayerChart's, in the scene's axes (chart x, height, chart y)
  const lineMaterial = new LineMaterial({ transparent: true, dashed: true, depthWrite: false });
  const lineMesh = new LineSegments2(new LineSegmentsGeometry(), lineMaterial);
  lineMesh.userData.unclipped = true;
  lineMesh.renderOrder = 1;
  scene.root.add(lineMesh);

  $effect(() => {
    const p = at;
    const segments: number[] = [];
    if (lines && p) {
      const w = ctx.width;
      const h = ctx.height;
      const { inX, inY, depth } = walls;
      const lift = 0.3;
      const traceX = axis === 'x' || axis === 'both';
      const traceY = axis === 'y' || axis === 'both';
      // Across the floor at the row's `x` / `y`
      if (traceX) segments.push(p.x, lift, 0, p.x, lift, h);
      if (traceY) segments.push(0, lift, p.y, w, lift, p.y);
      if (raised) {
        const wallY = walls.y + inY;
        const wallX = walls.x + inX;
        // Across each back wall at the row's height, and up it at the row's `x` / `y`
        segments.push(0, p.z, wallY, w, p.z, wallY);
        segments.push(wallX, p.z, 0, wallX, p.z, h);
        if (traceX) segments.push(p.x, 0, wallY, p.x, depth, wallY);
        if (traceY) segments.push(wallX, 0, p.y, wallX, depth, p.y);
      }
    }
    lineMesh.visible = segments.length > 0;
    if (segments.length) {
      lineMesh.geometry.dispose();
      lineMesh.geometry = new LineSegmentsGeometry().setPositions(segments);
      lineMesh.computeLineDistances();
    }
    scene.invalidate();
  });

  $effect(() => {
    const color = scene.color(lineLook.stroke ?? lineClassed?.stroke ?? faint);
    lineMaterial.color.copy(color?.color ?? new Color(0x888888));
    lineMaterial.opacity = (color?.opacity ?? 1) * (lineLook.opacity ?? 1) * opacity;
    lineMaterial.linewidth = lineLook.strokeWidth ?? lineClassed?.strokeWidth ?? 2;
    // Two pixels on, two off, as the view is fitted
    lineMaterial.dashSize = lineMaterial.gapSize = 2 * scene.unit;
    scene.invalidate();
  });

  // Shadows: a disc on the floor and each back wall, facing out of it
  const shadowMaterial = new MeshBasicMaterial({
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });
  const shadowGroup = new Group();
  shadowGroup.userData.unclipped = true;
  scene.root.add(shadowGroup);

  $effect(() => {
    const p = at;
    const discs: Mesh[] = [];
    if (shadows && p && raised) {
      const radius = (shadowLook.r ?? 6) * scene.unit;
      const disc = (geometry: BufferGeometry, px: number, up: number, py: number) => {
        const mesh = new Mesh(geometry, shadowMaterial);
        mesh.position.set(px, up, py);
        discs.push(mesh);
      };
      // The floor's faces up, the wall along `x` faces down `y`, and the wall along `y` across `x`
      disc(new CircleGeometry(radius, 32).rotateX(-Math.PI / 2), p.x, 0.2, p.y);
      disc(new CircleGeometry(radius, 32), p.x, p.z, walls.y + walls.inY);
      disc(new CircleGeometry(radius, 32).rotateY(Math.PI / 2), walls.x + walls.inX, p.z, p.y);
      shadowGroup.add(...discs);
    }
    scene.invalidate();
    return () => {
      for (const mesh of discs) {
        shadowGroup.remove(mesh);
        mesh.geometry.dispose();
      }
    };
  });

  $effect(() => {
    const color = scene.color(shadowLook.fill ?? shadowClassed?.fill ?? faint);
    shadowMaterial.color.copy(color?.color ?? new Color(0x888888));
    shadowMaterial.opacity =
      (color?.opacity ?? 1) * (shadowLook.opacity ?? shadowClassed?.opacity ?? 1) * opacity;
    scene.invalidate();
  });

  $effect(() => () => {
    scene.root.remove(lineMesh, shadowGroup);
    lineMesh.geometry.dispose();
    lineMaterial.dispose();
    shadowMaterial.dispose();
    scene.invalidate();
  });

  // The point, drawn over the scene facing the viewer, as LayerChart's `Highlight` draws it
  const markers = $derived.by((): SceneMarker[] => {
    const p = at;
    if (!points || !p) return [];
    const scaledR =
      r === true
        ? ctx.config.r
          ? Number(ctx.rGet(row))
          : undefined
        : r
          ? Number(ctx.rScale(accessor(r)(row)))
          : undefined;
    const radius = pointLook.r ?? scaledR;
    return [
      {
        key: 'highlight',
        x: p.x,
        y: p.y,
        z: p.z,
        r: radius ?? 4,
        fill: pointLook.fill ?? rowColor(ctx, undefined, row, 'var(--color-primary, currentColor)'),
        stroke: pointLook.stroke ?? 'white',
        strokeWidth: pointLook.strokeWidth ?? (radius ? 2 : 6),
        opacity: (pointLook.opacity ?? 1) * opacity,
        class: ['lc-highlight-point', pointLook.class].filter(Boolean).join(' '),
      },
    ];
  });
  $effect(() => scene.addMarkers(markers));
</script>
