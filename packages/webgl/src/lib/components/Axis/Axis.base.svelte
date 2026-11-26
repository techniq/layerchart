<script lang="ts" module>
  import type { AxisLineProps, AxisProps, AxisTextProps } from './Axis.shared.svelte.js';

  /** The faint gray of the core `Axis`' rule and tick marks */
  const defaultStroke =
    'color-mix(in oklab, var(--color-surface-content, currentColor) 50%, transparent)';
  const defaultFill = 'var(--color-surface-content, currentColor)';

  /** `color` at `opacity`, for what's drawn without one of its own (ex. a label's letters) */
  function faded(color: string, opacity: number) {
    return opacity >= 1 ? color : `color-mix(in oklab, ${color} ${opacity * 100}%, transparent)`;
  }
</script>

<!-- An axis' lines and labels, placed by `Axis.webgl.svelte` (in a `Group` when it's moved) -->
<script lang="ts">
  import { untrack } from 'svelte';
  import {
    autoTickFormat as tickFormat,
    autoTickVals,
    getChartContext,
    getTextRect,
    occlude,
  } from 'layerchart';

  import {
    getParent,
    getSceneContext,
    groupOpacity,
    setUnclipped,
    type SceneLabel,
  } from '../../contexts/scene.svelte.js';
  import { scaled, tickCount, tickSpacing } from '../../utils/marks.js';
  import { Group, Mesh } from 'three';
  import { createSegments } from '../../utils/lines.js';
  import { disposeLabel, fontFamily, labelPlane } from '../../utils/labels.js';
  import { createRowMotion } from '../../utils/rowMotion.svelte.js';
  import Text from '../Text/Text.webgl.svelte';
  import Grid from '../Grid/Grid.webgl.svelte';

  let {
    placement,
    label,
    labelPlacement = 'middle',
    labelProps,
    rule = false,
    grid = false,
    ticks,
    tickSpacing: tickSpacingProp,
    tickOcclusion = false,
    tickMultiline = false,
    tickLength = 4,
    tickMarks = true,
    format,
    tickLabelProps,
    tickLabel,
    scale: scaleProp,
    domain,
    stroke,
    fill,
    classes = {},
    motion,
    tickLabelOffset: tickLabelOffsetProp,
  }: Omit<
    AxisProps,
    'x' | 'initialX' | 'y' | 'initialY' | 'data' | 'key' | 'seriesKey' | 'center' | 'opacity'
  > = $props();

  const tickViewport = $derived(tickLabelProps?.viewport ?? false);
  const labelViewport = $derived(labelProps?.viewport ?? false);

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** The `Group` it's in (when moved or faded), which its labels over the scene move with */
  const parent = getParent();
  /** The `Group`s it's in fade it, as an SVG `<g>`'s opacity does */
  const inGroup = groupOpacity();
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
  /** Its own `scale` (on `domain` when given one, as the core `Axis`), else the chart's */
  const scale = $derived.by(() => {
    const own = scaleProp ?? (along === 'x' ? ctx.xScale : along === 'y' ? ctx.yScale : ctx.zScale);
    return domain && own ? own.copy().domain(domain) : own;
  });
  const length = $derived(along === 'x' ? ctx.width : along === 'y' ? ctx.height : ctx.zDepth);
  // Spaced as the core `Axis` spaces them
  const spacing = $derived(
    tickSpacingProp !== undefined ? tickSpacingProp : tickSpacing(ctx, along)
  );
  const count = $derived(spacing ? tickCount(length, spacing) : undefined);
  const values = $derived(autoTickVals(scale, ticks, count));
  const formatTick = $derived(
    tickFormat({ scale, ticks, count, formatType: format, multiline: tickMultiline, placement })
  );

  /** Each tick's value and where it's drawn along the axis */
  const tickPositions = $derived(values.map((value) => ({ value, p: scaled(scale, value) })));
  // Each tick eased to where it moves (none without `motion`), by its value
  const eased = untrack(() => createRowMotion(motion, ['p']));
  if (eased) {
    $effect.pre(() => {
      const next = tickPositions;
      untrack(() => {
        for (const { value, p } of next) eased.update(String(value), { p });
        eased.cleanup(new Set(next.map(({ value }) => String(value))));
      });
    });
  }
  /** Where each tick is drawn: eased there with `motion` */
  const placed = $derived(
    eased
      ? tickPositions.map((t) => ({ ...t, p: eased.get(String(t.value))?.p ?? t.p }))
      : tickPositions
  );

  /**
   * Which ticks' labels fit, by index, as the core `Axis`' `tickOcclusion` keeps them: each
   * measured where it's drawn on screen, in its font, and kept unless it overlaps one ranked
   * above it.  Across a flat chart only (`null` otherwise, keeping every tick): in a 3D view the
   * labels turn with it, so which overlap changes as it does.
   */
  const kept = $derived.by(() => {
    if (!tickOcclusion || ctx.view || along === 'z' || tickPositions.length <= 1) return null;
    const { padding = 4, priority = 'end' } = tickOcclusion === true ? {} : tickOcclusion;
    const size = tickLabelProps?.fontSize ?? 10;
    const style = {
      fontSize: `${size}px`,
      fontWeight: String(tickLabelProps?.fontWeight ?? 300),
      fontFamily: fontFamily(),
    };
    // In pixels on screen, from where they're headed (not where `motion` has them on the way)
    const items = tickPositions.map(({ value, p }, i) => {
      const lines = String(formatTick(value, i)).split('\n');
      const across = along === 'x';
      const rect = getTextRect(lines, across ? p / scene.unit : 0, across ? 0 : p / scene.unit, {
        style,
        fontSize: size,
        lineHeight: 11,
        textAnchor: tickLabelProps?.textAnchor ?? (across ? 'middle' : 'end'),
        verticalAnchor: tickLabelProps?.verticalAnchor ?? 'middle',
        rotate: tickLabelProps?.rotate ?? 0,
      });
      return { i, rect };
    });
    const last = items.length - 1;
    // Ranked as the core `Axis` ranks them: the last tick first (`'end'`), the first (`'start'`),
    // or both ends above the rest (`'start-end'`), thinning between them from the end
    const rank = ({ i }: { i: number }) =>
      priority === 'start'
        ? -i
        : priority === 'start-end' && (i === 0 || i === last)
          ? items.length
          : i;
    return new Set(
      occlude(items, (item) => item.rect, { priority: rank, padding }).map((t) => t.i)
    );
  });

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

  const joined = (...names: (string | undefined)[]) => names.filter(Boolean).join(' ') || undefined;
  /** What its `classes.root` sets, for all of it */
  const rootLook = $derived(scene.style(classes.root));

  /** The grid's lines: as asked (or in `stroke`), else as `Grid` draws them */
  const gridLines = $derived.by((): boolean | AxisLineProps => {
    if (!grid) return false;
    const own = typeof grid === 'object' ? grid : {};
    return { ...own, stroke: own.stroke ?? stroke, class: joined(classes.root, own.class) };
  });

  /** Pixels of the plot that read as one on screen, so marks and gaps keep their size in 3D */
  const unit = $derived(scene.unit);

  const tickLabelClass = $derived(joined(classes.root, classes.tickLabel, tickLabelProps?.class));
  const titleClass = $derived(
    joined('lc-webgl-axis-label', classes.root, classes.label, labelProps?.class)
  );
  /** What the labels' classes set (their fill, and opacity) */
  const tickLabelLook = $derived(scene.style(joined(classes.root, classes.tickLabel)));
  const titleLook = $derived(scene.style(joined(classes.root, classes.label)));

  /** A multi-line tick label lies past its edge by its near side, rather than its middle */
  const multiline = $derived(tickMultiline && along === 'x' && !tickViewport);

  const labels = $derived.by((): SceneLabel[] => {
    const w = ctx.width;
    const h = ctx.height;
    const { edgeX, edgeY, nearY, outX, outY, farX } = edges;
    // On the floor, labels across are placed by their middle (half a label further out), and the
    // left axis' by their end.  Facing the viewer, they're at the edge, anchored by their side
    // nearest it a gap of pixels away on screen, so the gap is the same however the view turns.
    // Half a cap height (as the core `Axis` anchors labels above and below by theirs)
    const half = along === 'y' || multiline ? 0 : (tickLabelProps?.fontSize ?? 10) * 0.36 * unit;
    const tickOut = tickViewport ? 0 : tickLabelOffset * unit + half;
    const outward = along === 'y' ? { x: outX, y: 0, z: 0 } : { x: 0, y: outY, z: 0 };

    const at = (p: number): [number, number, number] => {
      if (along === 'x') return [p, edgeY + outY * tickOut, 0];
      if (along === 'y') return [edgeX + outX * tickOut, p, 0];
      return [farX, nearY + outY * tickOut, p];
    };

    const result: SceneLabel[] = placed.flatMap(({ value, p }, i) => {
      if (kept && !kept.has(i)) return [];
      const [x, y, z] = at(p);
      return [
        {
          key: `${placement}-${i}`,
          x,
          y,
          z,
          text: String(formatTick(value, i)),
          class: tickLabelClass,
          ...(tickViewport && { outward, gap: tickLabelOffset }),
        },
      ];
    });

    if (label) {
      // Beyond the tick labels (facing the viewer, past as far as they reach out from the edge)
      const titleOffset = labelViewport ? 0 : (tickLabelOffset + (along === 'x' ? 26 : 34)) * unit;
      // Along the axis, at its start, middle, or end
      const along01 = labelPlacement === 'start' ? 0 : labelPlacement === 'end' ? 1 : 0.5;
      const [x, y, z] =
        along === 'x'
          ? [w * along01, edgeY + outY * titleOffset, 0]
          : along === 'y'
            ? [edgeX + outX * titleOffset, h * along01, 0]
            : [farX, nearY + edges.outY * titleOffset, ctx.zDepth * (1 - along01)];
      result.push({
        key: `${placement}-label`,
        x,
        y,
        z,
        text: typeof label === 'string' ? label : '',
        class: titleClass,
        ...(labelViewport && { outward, gap: tickLabelOffset + 22 }),
      });
    }
    return result;
  });

  const isTitle = (l: SceneLabel) => l.key === `${placement}-label`;
  /** Drawn by a snippet, rather than as a label of its own */
  const snipped = (l: SceneLabel) => (isTitle(l) ? typeof label === 'function' : !!tickLabel);
  const viewportLabels = $derived(
    labels.filter((l) => !snipped(l) && (isTitle(l) ? labelViewport : tickViewport))
  );
  const floorLabels = $derived(
    labels.filter((l) => !snipped(l) && !(isTitle(l) ? labelViewport : tickViewport))
  );

  const sizeOf = (l: SceneLabel) =>
    ((isTitle(l) ? labelProps : tickLabelProps)?.fontSize ?? (isTitle(l) ? 12 : 10)) * scene.unit;
  // Tick labels as the core `Axis` draws them: light, in the text color
  const weightOf = (l: SceneLabel) =>
    (isTitle(l) ? labelProps : tickLabelProps)?.fontWeight ?? (isTitle(l) ? 600 : 300);
  /** Its letters' color, faded with the axis */
  const fillOf = (l: SceneLabel) => {
    const look = isTitle(l) ? titleLook : tickLabelLook;
    const color =
      (isTitle(l) ? labelProps : tickLabelProps)?.fill ??
      (look?.fillSet ? look.fill : null) ??
      fill ??
      defaultFill;
    return faded(color, (look?.opacity ?? 1) * inGroup());
  };

  // Over the scene, moved with the `Group` it's in, as the floor's are
  $effect(() =>
    scene.addLabels(
      viewportLabels.map((l) => ({
        ...l,
        x: l.x + (parent?.x ?? 0),
        y: l.y + (parent?.y ?? 0),
        ...((fill != null || inGroup() < 1) && { color: fillOf(l) }),
      }))
    )
  );

  /**
   * A label lying on the floor: a `left` / `right` axis' end at it (away from the plot, on
   * whichever side it's on), the others centered
   */
  function anchorOf(l: SceneLabel): 'start' | 'middle' | 'end' {
    if (along !== 'y') {
      if (!isTitle(l) || labelPlacement === 'middle') return 'middle';
      return labelPlacement === 'start' ? 'start' : 'end';
    }
    return l.x < ctx.width / 2 ? 'end' : 'start';
  }

  /** A label's props for a `Text`, as drawn on the floor (or given a snippet) */
  function textProps(l: SceneLabel): AxisTextProps {
    const title = isTitle(l);
    const viewport = title ? labelViewport : tickViewport;
    const { outY } = edges;
    return {
      x: l.x,
      y: l.y,
      z: l.z,
      value: l.text,
      textAnchor: title ? anchorOf(l) : (tickLabelProps?.textAnchor ?? anchorOf(l)),
      verticalAnchor: title
        ? 'middle'
        : (tickLabelProps?.verticalAnchor ?? (multiline ? (outY > 0 ? 'start' : 'end') : 'middle')),
      rotate: title ? 0 : (tickLabelProps?.rotate ?? 0),
      fontSize: sizeOf(l),
      fontWeight: weightOf(l),
      fill: fillOf(l),
      class: title ? joined(classes.root, classes.label, labelProps?.class) : tickLabelClass,
      ...((viewport || placement === 'back') && { viewport: true }),
    };
  }
  const snippetLabels = $derived(labels.filter(snipped));
  /** The grid's lines at the ticks kept */
  const gridTicks = $derived(kept ? values.filter((_, i) => kept.has(i)) : values);

  /** A line set's color, width, and opacity: its own, else its classes', else the axis' */
  function lineStyle(own: boolean | AxisLineProps, className: string | undefined) {
    const props = typeof own === 'object' ? own : {};
    const look = scene.style(joined(classes.root, className, props.class));
    const color = scene.color(props.stroke ?? stroke ?? look?.stroke ?? defaultStroke);
    const opacity = (props.opacity ?? look?.opacity ?? rootLook?.opacity ?? 1) * inGroup();
    return {
      color: color && { ...color, opacity: color.opacity * opacity },
      width: props.strokeWidth ?? look?.strokeWidth ?? 1,
    };
  }

  // The rule along the edge and the marks out from it at each tick, as the core `Axis` draws
  // them (in the scene's axes: chart x, then height, then chart y)
  // A pixel wide on screen (not a device pixel), as the core `Axis`' rule and ticks
  const ruleLines = createSegments();
  const tickLines = createSegments();
  ruleLines.object.userData.unclipped = tickLines.object.userData.unclipped = true;
  layer.add(ruleLines.object, tickLines.object);
  $effect(() => {
    const w = ctx.width;
    const h = ctx.height;
    const d = ctx.zDepth;
    const { edgeX, edgeY, nearY, outX, outY, farX } = edges;
    const reach = tickLength * unit;
    const ruled: number[] = [];
    const marks: number[] = [];
    // Only the ticks whose labels are kept, as the core `Axis` drops the rest
    const ticked = kept ? placed.filter((_, i) => kept.has(i)) : placed;
    if (along === 'x') {
      if (rule) ruled.push(0, 0, edgeY, w, 0, edgeY);
      if (tickMarks)
        for (const { p } of ticked) marks.push(p, 0, edgeY, p, 0, edgeY + outY * reach);
    } else if (along === 'y') {
      if (rule) ruled.push(edgeX, 0, 0, edgeX, 0, h);
      if (tickMarks)
        for (const { p } of ticked) marks.push(edgeX, 0, p, edgeX + outX * reach, 0, p);
    } else if (d > 0) {
      if (rule) ruled.push(farX, 0, nearY, farX, d, nearY);
      if (tickMarks)
        for (const { p } of ticked) marks.push(farX, p, nearY, farX, p, nearY + outY * reach);
    }
    ruleLines.set(ruled);
    tickLines.set(marks);
    scene.invalidate();
  });
  $effect(() => {
    const ruled = lineStyle(rule, classes.rule);
    ruleLines.style(ruled.color, ruled.width);
    const marks = lineStyle(true, classes.tick);
    tickLines.style(marks.color, marks.width);
    scene.invalidate();
  });
  $effect(() => () => {
    layer.remove(ruleLines.object, tickLines.object);
    ruleLines.dispose();
    tickLines.dispose();
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
</script>

{#if grid && along !== 'z'}
  <Grid
    x={along === 'x' && gridLines}
    y={along === 'y' && gridLines}
    z={false}
    walls={false}
    xTicks={gridTicks}
    yTicks={gridTicks}
    {motion}
  />
{/if}

{#if placement !== 'back'}
  {#each floorLabels as l (l.key)}
    <Text {...textProps(l)} />
  {/each}
{/if}

{#each snippetLabels as l, i (l.key)}
  {#if isTitle(l)}
    {#if typeof label === 'function'}{@render label({ props: textProps(l) })}{/if}
  {:else}
    {@render tickLabel?.({ props: textProps(l), index: i })}
  {/if}
{/each}
