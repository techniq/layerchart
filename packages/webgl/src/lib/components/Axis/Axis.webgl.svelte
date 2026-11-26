<script lang="ts" module>
  import type { autoTickFormat } from 'layerchart';
  import type { AxisProps } from './Axis.shared.svelte.js';
</script>

<script lang="ts">
  import { autoTickFormat as tickFormat, autoTickVals, getChartContext } from 'layerchart';

  import { getSceneContext, setUnclipped, type SceneLabel } from '../../contexts/scene.svelte.js';
  import { scaled, tickCount, tickSpacing } from '../../utils/marks.js';
  import { Group, Mesh } from 'three';
  import { createSegments } from '../../utils/lines.js';
  import { disposeLabel, fontFamily, labelPlane } from '../../utils/labels.js';
  import Text from '../Text/Text.webgl.svelte';
  import Grid from '../Grid/Grid.webgl.svelte';

  let {
    placement,
    grid = false,
    label,
    ticks,
    tickSpacing: tickSpacingProp,
    format,
    rule = false,
    tickMarks = true,
    tickLength = 4,
    tickLabelOffset: tickLabelOffsetProp,
    tickLabelProps,
    labelProps,
  }: AxisProps = $props();

  const tickViewport = $derived(tickLabelProps?.viewport ?? false);
  const labelViewport = $derived(labelProps?.viewport ?? false);

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** Its objects, stacked with other marks' in the order they're declared */
  const layer = scene.layer();
  // Its labels lie beside the plot box, so aren't clipped to it
  setUnclipped();

  /** Along `x` (`bottom` / `top`), or `y` (`left` / `right`), else the height `z` (`back`) */
  const along = $derived(
    placement === 'bottom' || placement === 'top'
      ? 'x'
      : placement === 'left' || placement === 'right'
        ? 'y'
        : 'z'
  );

  /**
   * Pixels from the axis to its tick labels, as the core `Axis`: a tick's length to a side
   * label's end, and two more to a label above or below's cap height (`half` adds the rest)
   */
  const tickLabelOffset = $derived(
    tickLabelOffsetProp ?? (along === 'y' ? tickLength : tickLength + 2)
  );
  const scale = $derived(along === 'x' ? ctx.xScale : along === 'y' ? ctx.yScale : ctx.zScale);
  const length = $derived(along === 'x' ? ctx.width : along === 'y' ? ctx.height : ctx.zDepth);
  // Spaced as the core `Axis` spaces them
  const spacing = $derived(
    tickSpacingProp !== undefined ? tickSpacingProp : tickSpacing(ctx, along)
  );
  const count = $derived(spacing ? tickCount(length, spacing) : undefined);
  const values = $derived(autoTickVals(scale, ticks, count));
  const formatTick = $derived(tickFormat({ scale, ticks, count, formatType: format }));

  /**
   * The floor's edges the axis lies along (the ones nearest the camera, else across from them),
   * which way is out from the plot box, and the corner `z` stands up
   */
  const edges = $derived.by(() => {
    const w = ctx.width;
    const h = ctx.height;
    const nearX = scene.far.x === 'min' ? w : 0;
    const nearY = scene.far.y === 'min' ? h : 0;
    // `z` stands up the corner where the wall behind on `x` meets the front
    const outX = nearX === w ? 1 : -1;
    const outY = nearY === h ? 1 : -1;
    return {
      // The edge a `right` / `top` axis is on: the other side, facing out the other way
      edgeX: placement === 'right' ? w - nearX : nearX,
      edgeY: placement === 'top' ? h - nearY : nearY,
      outX: placement === 'right' ? -outX : outX,
      outY: placement === 'top' ? -outY : outY,
      nearY,
      farX: w - nearX,
    };
  });

  /** The grid's stroke: its own, or the one its `class` sets (else `Grid`'s) */
  const gridStroke = $derived.by(() => {
    if (typeof grid !== 'object') return undefined;
    return grid.stroke ?? scene.style(grid.class)?.stroke ?? undefined;
  });

  /** Pixels of the plot that read as one on screen, so marks and gaps keep their size in 3D */
  const unit = $derived(scene.unit);

  const labels = $derived.by((): SceneLabel[] => {
    const w = ctx.width;
    const h = ctx.height;
    const { edgeX, edgeY, nearY, outX, outY, farX } = edges;
    // On the floor, labels across are placed by their middle (half a label further out), and the
    // left axis' by their end.  Facing the viewer, they're at the edge, anchored by their side
    // nearest it a gap of pixels away on screen, so the gap is the same however the view turns.
    // Half a cap height (as the core `Axis` anchors labels above and below by theirs)
    const half = along === 'y' ? 0 : (tickLabelProps?.fontSize ?? 10) * 0.36 * unit;
    const tickOut = tickViewport ? 0 : tickLabelOffset * unit + half;
    const outward = along === 'y' ? { x: outX, y: 0, z: 0 } : { x: 0, y: outY, z: 0 };

    const at = (value: unknown): [number, number, number] => {
      const p = scaled(scale, value);
      if (along === 'x') return [p, edgeY + outY * tickOut, 0];
      if (along === 'y') return [edgeX + outX * tickOut, p, 0];
      return [farX, nearY + outY * tickOut, p];
    };

    const result: SceneLabel[] = values.map((value, i) => {
      const [x, y, z] = at(value);
      return {
        key: `${placement}-${i}`,
        x,
        y,
        z,
        text: String(formatTick(value, i)),
        class: tickLabelProps?.class,
        ...(tickViewport && { outward, gap: tickLabelOffset }),
      };
    });

    if (label) {
      // Beyond the tick labels (facing the viewer, past as far as they reach out from the edge)
      const titleOffset = labelViewport ? 0 : (tickLabelOffset + (along === 'x' ? 26 : 34)) * unit;
      const [x, y, z] =
        along === 'x'
          ? [w / 2, edgeY + outY * titleOffset, 0]
          : along === 'y'
            ? [edgeX + outX * titleOffset, h / 2, 0]
            : [farX, nearY + edges.outY * titleOffset, ctx.zDepth / 2];
      result.push({
        key: `${placement}-label`,
        x,
        y,
        z,
        text: label,
        class: ['lc-webgl-axis-label', labelProps?.class].filter(Boolean).join(' '),
        ...(labelViewport && { outward, gap: tickLabelOffset + 22 }),
      });
    }
    return result;
  });

  const isTitle = (l: SceneLabel) => l.key === `${placement}-label`;
  const viewportLabels = $derived(
    labels.filter((l) => (isTitle(l) ? labelViewport : tickViewport))
  );
  const floorLabels = $derived(labels.filter((l) => !(isTitle(l) ? labelViewport : tickViewport)));

  $effect(() => scene.addLabels(viewportLabels));

  const sizeOf = (l: SceneLabel) =>
    ((isTitle(l) ? labelProps : tickLabelProps)?.fontSize ?? (isTitle(l) ? 12 : 10)) * scene.unit;
  // Tick labels as the core `Axis` draws them: light, in the text color
  const weightOf = (l: SceneLabel) =>
    (isTitle(l) ? labelProps : tickLabelProps)?.fontWeight ?? (isTitle(l) ? 600 : 300);
  const fillOf = (l: SceneLabel) =>
    (isTitle(l) ? labelProps : tickLabelProps)?.fill ??
    'var(--color-surface-content, currentColor)';

  // The rule along the edge and the marks out from it at each tick, as the core `Axis` draws
  // them (in the scene's axes: chart x, then height, then chart y)
  // A pixel wide on screen (not a device pixel), as the core `Axis`' rule and ticks
  const lines = createSegments();
  lines.object.userData.unclipped = true;
  layer.add(lines.object);
  $effect(() => {
    const w = ctx.width;
    const h = ctx.height;
    const d = ctx.zDepth;
    const { edgeX, edgeY, nearY, outX, outY, farX } = edges;
    const reach = tickLength * unit;
    const segments: number[] = [];
    if (along === 'x') {
      if (rule) segments.push(0, 0, edgeY, w, 0, edgeY);
      if (tickMarks)
        for (const v of values) {
          const p = scaled(scale, v);
          segments.push(p, 0, edgeY, p, 0, edgeY + outY * reach);
        }
    } else if (along === 'y') {
      if (rule) segments.push(edgeX, 0, 0, edgeX, 0, h);
      if (tickMarks)
        for (const v of values) {
          const p = scaled(scale, v);
          segments.push(edgeX, 0, p, edgeX + outX * reach, 0, p);
        }
    } else if (d > 0) {
      if (rule) segments.push(farX, 0, nearY, farX, d, nearY);
      if (tickMarks)
        for (const v of values) {
          const p = scaled(scale, v);
          segments.push(farX, p, nearY, farX, p, nearY + outY * reach);
        }
    }
    lines.set(segments);
    scene.invalidate();
  });
  $effect(() => {
    const color = scene.color(
      'color-mix(in oklab, var(--color-surface-content, currentColor) 50%, transparent)'
    );
    lines.style(color, 1);
    scene.invalidate();
  });
  $effect(() => () => {
    layer.remove(lines.object);
    lines.dispose();
  });

  // The height axis' labels stand on the back wall its edge is on, reading along it from the
  // edge outward, so they turn with the walls as the floor's turn with the floor
  const wall = new Group();
  wall.userData.unclipped = true;
  layer.add(wall);
  $effect(() => {
    const planes: Mesh[] = [];
    if (placement === 'back') {
      const w = ctx.width;
      const h = ctx.height;
      const nearX = scene.far.x === 'min' ? w : 0;
      const nearY = scene.far.y === 'min' ? h : 0;
      const farX = w - nearX;
      const outY = nearY === h ? 1 : -1;
      // Facing the near side, where the camera is, so its text reads left to right
      const toward = nearX > farX ? 1 : -1;
      const family = fontFamily();
      for (const l of floorLabels) {
        const label = labelPlane(l.text, {
          family,
          fontSize: sizeOf(l),
          fontWeight: weightOf(l),
          color: scene.color(fillOf(l)),
        });
        if (!label) continue;
        const { mesh, width } = label;
        mesh.geometry.rotateY((toward * Math.PI) / 2);
        const gap = (isTitle(l) ? tickLabelOffset + 34 : tickLabelOffset) * unit;
        mesh.position.set(farX + toward * 0.3, l.z, nearY + outY * (gap + width / 2));
        planes.push(mesh);
      }
      if (planes.length) wall.add(...planes);
    }
    scene.invalidate();
    return () => {
      for (const mesh of planes) {
        wall.remove(mesh);
        disposeLabel(mesh);
      }
    };
  });
  $effect(() => () => {
    layer.remove(wall);
    scene.invalidate();
  });

  /**
   * A label lying on the floor: a `left` / `right` axis' end at it (away from the plot, on
   * whichever side it's on), the others centered
   */
  function anchorOf(l: SceneLabel): 'start' | 'middle' | 'end' {
    if (along !== 'y') return 'middle';
    return l.x < ctx.width / 2 ? 'end' : 'start';
  }
</script>

{#if grid && along !== 'z'}
  <Grid
    x={along === 'x'}
    y={along === 'y'}
    z={false}
    walls={false}
    xTicks={ticks}
    yTicks={ticks}
    stroke={gridStroke}
  />
{/if}

{#if placement !== 'back'}
  {#each floorLabels as l (l.key)}
    <Text
      x={l.x}
      y={l.y}
      z={l.z}
      value={l.text}
      textAnchor={isTitle(l) ? anchorOf(l) : (tickLabelProps?.textAnchor ?? anchorOf(l))}
      verticalAnchor={isTitle(l) ? 'middle' : (tickLabelProps?.verticalAnchor ?? 'middle')}
      rotate={isTitle(l) ? 0 : (tickLabelProps?.rotate ?? 0)}
      fontSize={sizeOf(l)}
      fontWeight={weightOf(l)}
      fill={fillOf(l)}
    />
  {/each}
{/if}
