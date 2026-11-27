<script lang="ts" module>
  import type { HighlightProps } from './Highlight.shared.svelte.js';
</script>

<script lang="ts">
  import { HighlightBase, HighlightState, type HighlightPoint } from 'layerchart/base';
  import Arc from '../Arc/Arc.webgl.svelte';
  import Bar from '../Bar/Bar.webgl.svelte';
  import Circle from '../Circle/Circle.webgl.svelte';
  import Line from '../Line/Line.webgl.svelte';
  import Rect from '../Rect/Rect.webgl.svelte';
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
    area = false,
    bar = false,
    opacity = 1,
    motion: motionProp,
    onAreaClick,
    onBarClick,
    onPointClick,
    onPointEnter,
    onPointLeave,
  }: HighlightProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** Its objects, stacked with other marks' in the order they're declared */
  const layer = scene.layer();

  const faint = 'color-mix(in oklab, var(--color-surface-content, currentColor) 20%, transparent)';
  const pointLook = $derived(typeof points === 'object' ? points : {});
  const lineLook = $derived(typeof lines === 'object' ? lines : {});
  const shadowLook = $derived(typeof shadows === 'object' ? shadows : {});
  const lineClassed = $derived(scene.style(lineLook.class));
  const shadowClassed = $derived(scene.style(shadowLook.class));

  const row = $derived(data ?? ctx.tooltip.data);

  /**
   * What the core `Highlight` marks for the row: a point for each series at its position (ex. each
   * band of a stack, `y={[0, 1]}`), each in its series' color
   */
  const state = new HighlightState(
    () => ({ data, x, y, z, r, axis: axisProp, points, lines, opacity }) as any
  );

  /** Which positions the lines trace, as the core `Highlight` picks by default */
  const axis = $derived(axisProp ?? (isScaleBand(ctx.yScale) || ctx.valueAxis === 'x' ? 'y' : 'x'));

  /** The row in the chart's pixels: across, down, and up off the floor */
  const target = $derived.by(() => {
    if (row == null) return null;
    // A row spanning values (ex. a stack's band, `y={[0, 1]}`) is traced at their middle, as core's
    const [px, py] = ctx.geo.projection
      ? position(ctx, accessor(x ?? ctx.x)(row), accessor(y ?? ctx.y)(row))
      : [Number(state.xCoordScalar) + state.xOffset, Number(state.yCoordScalar) + state.yOffset];
    if (!Number.isFinite(px) || !Number.isFinite(py)) return null;
    const height =
      z != null
        ? ctx.heightOf(row, accessor(z))[1]
        : ctx.config.z != null
          ? ctx.heightOf(row)[1]
          : 0;
    return { x: px, y: py, z: height };
  });

  // Gliding from one row to the next (fixed when it mounts, as the core marks' motion is)
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

  // Lines: dashed, as core's are, in the scene's axes (chart x, height, chart y)
  const lineMaterial = new LineMaterial({ transparent: true, dashed: true, depthWrite: false });
  const lineMesh = new LineSegments2(new LineSegmentsGeometry(), lineMaterial);
  lineMesh.userData.unclipped = true;
  lineMesh.renderOrder = 1;
  layer.add(lineMesh);

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
  layer.add(shadowGroup);

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
    layer.remove(lineMesh, shadowGroup);
    lineMesh.geometry.dispose();
    lineMaterial.dispose();
    shadowMaterial.dispose();
    scene.invalidate();
  });

  // The points, drawn over the scene facing the viewer, as the core `Highlight` draws them
  const markers = $derived.by((): SceneMarker[] => {
    const p = at;
    if (!points || !p || !target) return [];
    const scaledR =
      r === true
        ? ctx.config.r
          ? Number(ctx.rGet(row))
          : undefined
        : r
          ? Number(ctx.rScale(accessor(r)(row)))
          : undefined;
    const own: HighlightPoint = {
      x: target.x,
      y: target.y,
      fill: '',
      data: { x: accessor(x ?? ctx.x)(row), y: accessor(y ?? ctx.y)(row) },
    };
    // A projection places the row itself; otherwise each series' point at the row, as core's
    const list = ctx.geo.projection ? [own] : state.points;
    // Each moved by how far the glide still is from the row, so they glide along with it
    const dx = p.x - target.x;
    const dy = p.y - target.y;
    return list.map((point, i) => {
      const radius = pointLook.r ?? point.r ?? scaledR;
      const fill =
        pointLook.fill ||
        point.fill ||
        rowColor(ctx, undefined, row, 'var(--color-primary, currentColor)');
      // The other series' points faded while one is highlighted (ex. from the legend)
      const seriesOpacity = point.seriesKey
        ? ctx.series.isHighlighted(point.seriesKey, true)
          ? 1
          : 0.1
        : 1;
      /** The point as the core `Highlight`'s handlers are given it, with the highlighted row */
      const detail = () => ({ point: { ...point, r: radius, fill }, data: row });
      return {
        key: `highlight-${i}`,
        x: point.x + dx,
        y: point.y + dy,
        z: p.z,
        r: radius ?? 4,
        fill,
        stroke: pointLook.stroke ?? 'white',
        strokeWidth: pointLook.strokeWidth ?? (radius ? 2 : 6),
        opacity: (pointLook.opacity ?? 1) * opacity * seriesOpacity,
        class: ['lc-highlight-point', pointLook.class].filter(Boolean).join(' '),
        // Taking the pointer only with a handler, else letting it through to the scene beneath
        ...(onPointClick && { onclick: (e: MouseEvent) => onPointClick(e, detail()) }),
        ...(onPointEnter && { onpointerenter: (e: PointerEvent) => onPointEnter(e, detail()) }),
        ...(onPointLeave && { onpointerleave: (e: PointerEvent) => onPointLeave(e, detail()) }),
      } satisfies SceneMarker;
    });
  });
  $effect(() => scene.addMarkers(markers));
</script>

<!-- The band or slice under the row, as the core `Highlight` draws its `area` -->
{#if area}
  <HighlightBase
    {data}
    {x}
    {y}
    axis={axisProp}
    area={area as any}
    points={false}
    lines={false}
    {opacity}
    motion={motionProp}
    {onAreaClick}
    {Circle}
    {Line}
    {Rect}
    {Arc}
  />
{/if}

<!-- The row's bar over its own, as the core `Highlight` draws its `bar` -->
{#if bar && row != null}
  {#if typeof bar === 'function'}
    {@render bar()}
  {:else}
    {@const own = typeof bar === 'object' ? bar : {}}
    <Bar
      data={row}
      motion={(motionProp ?? 'spring') === 'spring' ? 'spring' : undefined}
      fill="var(--color-primary, currentColor)"
      {opacity}
      {...own}
      class={['lc-highlight-bar', own.class].filter(Boolean).join(' ')}
      onclick={onBarClick && ((e: MouseEvent) => onBarClick(e, { data: row }))}
    />
  {/if}
{/if}
