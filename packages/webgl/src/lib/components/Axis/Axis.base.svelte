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
    filterTicksByFormat,
    getChartContext,
    isScaleBand,
    isScaleUtc,
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
  import { circleSegments, pointRadial } from '../../utils/radial.js';
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

  /**
   * Around a `radial` chart's center: its angles (`angle`, the `x` scale's) or out from it
   * (`radius`, the `y` scale's), as the core `Axis` draws them
   */
  const radial = $derived(placement === 'angle' || placement === 'radius');
  /**
   * Along `x` (`bottom` / `top`, or `angle`), or `y` (`left` / `right`, or `radius`), else the
   * height `z` (`back`)
   */
  const along = $derived(
    placement === 'bottom' || placement === 'top' || placement === 'angle'
      ? 'x'
      : placement === 'left' || placement === 'right' || placement === 'radius'
        ? 'y'
        : 'z'
  );
  /** A `radial` chart's inner and outer radius */
  const radii = $derived.by(() => {
    const [r0, r1] = (ctx.yRange as number[]).map(Number);
    return [Math.min(r0, r1), Math.max(r0, r1)];
  });

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
  const length = $derived.by(() => {
    // Around its arc (as the core `Axis` spaces them, so they don't change with the chart's
    // width), or out to its edge
    if (placement === 'angle') {
      const [a0, a1] = (ctx.xRange as number[]).map(Number);
      return Math.abs(a1 - a0) * radii[1];
    }
    if (placement === 'radius') return ctx.height / 2;
    return along === 'x' ? ctx.width : along === 'y' ? ctx.height : ctx.zDepth;
  });
  /** Its bars' interval (ex. a bar chart's days), which centers its ticks in theirs */
  const interval = $derived(along === 'x' ? ctx.xInterval : along === 'y' ? ctx.yInterval : null);
  // Spaced as the core `Axis` spaces them: a band scale's every band, unless in an interval
  const spacing = $derived(
    tickSpacingProp !== undefined
      ? tickSpacingProp
      : isScaleBand(scale) && interval == null
        ? null
        : tickSpacing(ctx, along)
  );
  // A count asked for, as the core `Axis` takes it, else one per `spacing`
  const count = $derived(
    typeof ticks === 'number' ? ticks : spacing ? tickCount(length, spacing) : undefined
  );
  /**
   * The count its format is picked for, as the core `Axis` picks it: by the default spacing, so a
   * band scale's every-band ticks still read as dates (ex. `'day'`) rather than in full
   */
  const formatCount = $derived(
    typeof ticks === 'number' ? ticks : tickCount(length, tickSpacing(ctx, along))
  );
  const values = $derived.by(() => {
    let values = autoTickVals(scale, ticks, count);
    // Centered in an interval (ex. a bar chart's), one on the domain's end would label a bar past
    // the last, so it's dropped, as the core `Axis` drops it
    if (interval != null && values.length) {
      const last = values[values.length - 1];
      if (+last >= +scale.domain()[1]) values = values.slice(0, -1);
    }
    // Only those on the boundary its format implies (ex. whole numbers for `'integer'`)
    return filterTicksByFormat(values, format, { utc: isScaleUtc(scale) });
  });
  const formatTick = $derived(
    tickFormat({
      scale,
      ticks,
      count: formatCount,
      formatType: format,
      multiline: tickMultiline,
      placement,
    })
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
    if (!tickOcclusion || ctx.view || along === 'z' || radial || tickPositions.length <= 1)
      return null;
    const { padding = 4, priority = 'end' } = tickOcclusion === true ? {} : tickOcclusion;
    const size = tickFontSize;
    const style = {
      fontSize: `${size}px`,
      fontWeight: String(tickFontWeight),
      fontFamily: fontFamily(),
    };
    // In pixels on screen, from where they're headed (not where `motion` has them on the way)
    const items = tickPositions.map(({ value, p }, i) => {
      const lines = String(formatTick(value, i)).split('\n');
      const across = along === 'x';
      const anchors = tickAnchors(p);
      const rect = getTextRect(lines, across ? p / scene.unit : 0, across ? 0 : p / scene.unit, {
        style,
        fontSize: size,
        lineHeight: 11,
        textAnchor: anchors.textAnchor,
        verticalAnchor: anchors.verticalAnchor,
        dx: anchors.dx,
        dy: anchors.dy,
        rotate: anchors.rotate,
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
    // A plot squeezed past nothing (its padding more than its size) puts its axes at its
    // range's ends, as the core `Axis` (ex. a bottom axis at the top, `0`, rather than above it)
    const w = Math.max(ctx.width, 0);
    const h = Math.max(ctx.height, 0);
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
  const tickLabelLook = $derived(
    scene.style(joined(classes.root, classes.tickLabel, tickLabelProps?.class))
  );
  const titleLook = $derived(scene.style(joined(classes.root, classes.label, labelProps?.class)));

  /** The font its class sets (ex. `text-sm font-semibold`), where it sets one of its own */
  const plainFont = $derived(scene.font(null));
  function classFont(className: string | undefined) {
    const own = className ? scene.font(className) : null;
    return {
      size: own && plainFont && own.size !== plainFont.size ? own.size : null,
      weight: own && plainFont && own.weight !== plainFont.weight ? own.weight : null,
    };
  }
  const tickClassFont = $derived(classFont(joined(classes.tickLabel, tickLabelProps?.class)));
  const titleClassFont = $derived(classFont(joined(classes.label, labelProps?.class)));
  // As the core `Axis` draws its labels (10px and light), else as asked or their classes set
  const tickFontSize = $derived(tickLabelProps?.fontSize ?? tickClassFont.size ?? 10);
  const tickFontWeight = $derived(tickLabelProps?.fontWeight ?? tickClassFont.weight ?? 300);
  const titleFontSize = $derived(labelProps?.fontSize ?? titleClassFont.size ?? 10);
  const titleFontWeight = $derived(labelProps?.fontWeight ?? titleClassFont.weight ?? 300);

  type Anchors = {
    textAnchor: 'start' | 'middle' | 'end';
    verticalAnchor: 'start' | 'middle' | 'end';
    /** Pixels across and down from its point (unturned) */
    dx: number;
    dy: number;
    /** Degrees it turns about its point */
    rotate: number;
  };

  /**
   * A tick label's anchors and offset from its tick, as the core `Axis` places them (by which
   * side of the plot box it's out from, or around a `radial` chart), then `tickLabelProps`' own
   */
  function tickAnchors(p: number): Anchors {
    const { outX, outY } = edges;
    const own = tickLabelProps ?? {};
    let base: Omit<Anchors, 'rotate'>;
    if (placement === 'angle') {
      const ends = p === 0 || Math.abs(p - Math.PI) < 0.01 || Math.abs(p - Math.PI * 2) < 0.01;
      base = {
        textAnchor: ends ? 'middle' : p > Math.PI ? 'end' : 'start',
        verticalAnchor: 'middle',
        dx: Math.sin(p) * tickLength,
        dy: -Math.cos(p) * (tickLength + 4),
      };
    } else if (placement === 'radius') {
      base = { textAnchor: 'middle', verticalAnchor: 'middle', dx: 2, dy: 0 };
    } else if (along === 'x') {
      // By its cap height's top below the axis (bottom up above it), as the core `Axis`
      base = {
        textAnchor: 'middle',
        verticalAnchor: outY > 0 ? 'start' : 'end',
        dx: 0,
        dy: outY * tickLabelOffset,
      };
    } else {
      base = {
        textAnchor: outX < 0 ? 'end' : 'start',
        verticalAnchor: 'middle',
        dx: outX * tickLabelOffset,
        dy: 0,
      };
    }
    return {
      textAnchor: own.textAnchor ?? base.textAnchor,
      verticalAnchor: own.verticalAnchor ?? base.verticalAnchor,
      dx: own.dx ?? base.dx,
      dy: own.dy ?? base.dy,
      rotate: own.rotate ?? 0,
    };
  }

  /**
   * The title's place and anchors across a flat chart, as the core `Axis` sets them: against the
   * padding's outer edge on its side (or its start or end), turned to read up a side's middle,
   * then `labelProps`' own
   */
  function titlePlace(): Anchors & { x: number; y: number } {
    const w = ctx.width;
    const h = ctx.height;
    const pad = ctx.padding;
    const across = along === 'x' && !radial;
    const upright = along === 'y' && !radial;
    const at = labelPlacement;
    const own = labelProps ?? {};
    const x =
      placement === 'left' || (across && at === 'start')
        ? -pad.left
        : placement === 'right' || (across && at === 'end')
          ? w + pad.right
          : w / 2;
    const y =
      placement === 'top' || (upright && at === 'start')
        ? -pad.top
        : upright && at === 'middle'
          ? h / 2
          : placement === 'bottom' || at === 'end'
            ? h + pad.bottom
            : 0;
    const textAnchor =
      at === 'middle'
        ? 'middle'
        : placement === 'right' || (across && at === 'end')
          ? 'end'
          : 'start';
    const verticalAnchor =
      placement === 'top' ||
      (upright && at === 'start') ||
      (placement === 'left' && at === 'middle')
        ? 'start'
        : 'end';
    return {
      x,
      y,
      textAnchor: own.textAnchor ?? textAnchor,
      verticalAnchor: own.verticalAnchor ?? verticalAnchor,
      dx: own.dx ?? 0,
      dy: own.dy ?? 0,
      rotate: own.rotate ?? (upright && at === 'middle' ? -90 : 0),
    };
  }

  /**
   * How far its labels (and a title pinned to an edge) reach past each side of the plot, for a
   * chart with an `'auto'` padding side to fit, as the core `Axis` reports it.  `null` otherwise,
   * so a chart without one doesn't measure.
   */
  const autoPadding = $derived.by(() => {
    if (!ctx.autoPaddingSides.length || ctx.view || radial || along === 'z') return null;
    const w = ctx.width;
    const h = ctx.height;
    const overflow = { top: 0, right: 0, bottom: 0, left: 0 };
    const { edgeX, edgeY } = edges;
    const style = {
      fontSize: `${tickFontSize}px`,
      fontWeight: String(tickFontWeight),
      fontFamily: fontFamily(),
    };
    tickPositions.forEach(({ value, p }, i) => {
      if (kept && !kept.has(i)) return;
      const lines = String(formatTick(value, i)).split('\n');
      const [x, y] = along === 'x' ? [p, edgeY] : [edgeX, p];
      const rect = getTextRect(lines, x, y, {
        style,
        fontSize: tickFontSize,
        lineHeight: 11,
        ...tickAnchors(p),
      });
      overflow.left = Math.max(overflow.left, -rect.x);
      overflow.top = Math.max(overflow.top, -rect.y);
      overflow.right = Math.max(overflow.right, rect.x + rect.width - w);
      overflow.bottom = Math.max(overflow.bottom, rect.y + rect.height - h);
    });
    // The title sits against the padding's outer edge, so it needs its thickness on top
    if (typeof label === 'string' && label) {
      const rect = getTextRect(label, 0, 0, {
        style: {
          fontSize: `${titleFontSize}px`,
          fontWeight: String(titleFontWeight),
          fontFamily: fontFamily(),
        },
        fontSize: titleFontSize,
        rotate: titlePlace().rotate,
      });
      const gap = 4;
      if (along === 'y' && labelPlacement !== 'middle') {
        overflow[labelPlacement === 'start' ? 'top' : 'bottom'] += rect.height + gap;
      } else {
        const side = placement as 'top' | 'right' | 'bottom' | 'left';
        overflow[side] += (along === 'y' ? rect.width : rect.height) + gap;
      }
    }
    const fit = (value: number) => (value > 0 ? Math.ceil(value + 2) : 0);
    return {
      top: fit(overflow.top),
      right: fit(overflow.right),
      bottom: fit(overflow.bottom),
      left: fit(overflow.left),
    };
  });
  // Reported rather than read: the labels depend on the plot size the padding decides
  const paddingKey = Symbol('Axis');
  $effect.pre(() => {
    ctx._reportAutoPadding(paddingKey, autoPadding);
  });
  $effect.pre(() => () => ctx._reportAutoPadding(paddingKey, null));

  type AxisLabel = SceneLabel & { rotate?: number };

  const labels = $derived.by((): AxisLabel[] => {
    const w = ctx.width;
    const h = ctx.height;
    const { edgeX, edgeY, nearY, outX, outY, farX } = edges;
    // Facing the viewer, they're at the edge, anchored by their side nearest it a gap of pixels
    // away on screen, so the gap is the same however the view turns.  On the floor, they're at
    // their tick, offset as the core `Axis` offsets them (see `tickAnchors`).
    const outward = along === 'y' ? { x: outX, y: 0, z: 0 } : { x: 0, y: outY, z: 0 };
    const tickOut = placement === 'back' ? tickLabelOffset * unit : 0;

    const at = (p: number): [number, number, number] => {
      if (placement === 'angle') {
        const [x, y] = pointRadial(p, radii[1]);
        return [x, y, 0];
      }
      if (placement === 'radius') return [0, p, 0];
      if (along === 'x') return [p, edgeY, 0];
      if (along === 'y') return [edgeX, p, 0];
      return [farX, nearY + outY * tickOut, p];
    };

    const result: AxisLabel[] = placed.flatMap(({ value, p }, i) => {
      if (kept && !kept.has(i)) return [];
      const [x, y, z] = at(p);
      const anchors = tickViewport ? null : tickAnchors(p);
      return [
        {
          key: `${placement}-${i}`,
          x,
          y,
          z,
          text: String(formatTick(value, i)),
          class: tickLabelClass,
          ...(tickViewport && { outward, gap: tickLabelOffset }),
          ...anchors,
        },
      ];
    });

    if (label) {
      const text = typeof label === 'string' ? label : '';
      if (!ctx.view && !labelViewport) {
        // Across a flat chart, where the core `Axis` puts it
        const { x, y, ...anchors } = titlePlace();
        result.push({ key: `${placement}-label`, x, y, z: 0, text, class: titleClass, ...anchors });
      } else {
        // Beyond the tick labels (facing the viewer, past as far as they reach out from the edge)
        const titleOffset = labelViewport
          ? 0
          : (tickLabelOffset + (along === 'x' ? 26 : 34)) * unit;
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
          text,
          class: titleClass,
          ...(labelViewport && { outward, gap: tickLabelOffset + 22 }),
        });
      }
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

  const sizeOf = (l: SceneLabel) => (isTitle(l) ? titleFontSize : tickFontSize) * scene.unit;
  const weightOf = (l: SceneLabel) => (isTitle(l) ? titleFontWeight : tickFontWeight);
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
      viewportLabels.map(({ rotate: _rotate, ...l }) => ({
        ...l,
        x: l.x + (parent?.x ?? 0),
        y: l.y + (parent?.y ?? 0),
        ...((fill != null || inGroup() < 1) && { color: fillOf(l) }),
      }))
    )
  );

  /**
   * A label lying on the floor in a 3D view: a `left` / `right` axis' end at it (away from the
   * plot, on whichever side it's on), the others centered
   */
  function anchorOf(l: SceneLabel): 'start' | 'middle' | 'end' {
    if (along !== 'y') {
      if (!isTitle(l) || labelPlacement === 'middle') return 'middle';
      return labelPlacement === 'start' ? 'start' : 'end';
    }
    return l.x < ctx.width / 2 ? 'end' : 'start';
  }

  /** A label's props for a `Text`, as drawn on the floor (or given a snippet) */
  function textProps(l: AxisLabel): AxisTextProps {
    const title = isTitle(l);
    const viewport = title ? labelViewport : tickViewport;
    return {
      x: l.x,
      y: l.y,
      z: l.z,
      value: l.text,
      textAnchor: l.textAnchor ?? anchorOf(l),
      verticalAnchor: l.verticalAnchor ?? 'middle',
      dx: (l.dx ?? 0) * unit,
      dy: (l.dy ?? 0) * unit,
      rotate: l.rotate ?? 0,
      fontSize: sizeOf(l),
      fontWeight: weightOf(l),
      // As the core `Axis`' (`7px` and `11px`), so lines stack as they do there
      capHeight: 7 * unit,
      lineHeight: 11 / (title ? titleFontSize : tickFontSize),
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
    if (placement === 'angle') {
      // A spoke at the first angle, and a mark out from the rim at each tick
      const [r0, r1] = radii;
      const start = Math.min(...(ctx.xRange as number[]).map(Number));
      if (rule) {
        const [x1, y1] = pointRadial(start, r0);
        const [x2, y2] = pointRadial(start, r1);
        ruled.push(x1, 0, y1, x2, 0, y2);
      }
      if (tickMarks)
        for (const { p } of ticked) {
          const [x1, y1] = pointRadial(p, r1);
          const [x2, y2] = pointRadial(p, r1 + reach);
          marks.push(x1, 0, y1, x2, 0, y2);
        }
    } else if (placement === 'radius') {
      // Its rim (the core `Axis` draws no tick marks out from the center)
      if (rule) ruled.push(...circleSegments(radii[1]));
    } else if (along === 'x') {
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
  /** The rule's markers (ex. `rule={{ markerEnd: 'arrow' }}`), as the core `Rule` draws them */
  const ruleMarkers = $derived.by(() => {
    if (typeof rule !== 'object') return null;
    const { marker, markerStart, markerMid, markerEnd } = rule;
    if (!marker && !markerStart && !markerMid && !markerEnd) return null;
    const look = scene.style(joined(classes.root, classes.rule, rule.class));
    return {
      marker,
      markerStart,
      markerMid,
      markerEnd,
      strokeWidth: rule.strokeWidth ?? look?.strokeWidth ?? 1,
      opacity: (rule.opacity ?? look?.opacity ?? 1) * inGroup(),
    };
  });
  /**
   * The rule as the core `Rule` draws it, for its markers: across from the left (or round from
   * 12 o'clock's spoke), and up a side from the bottom
   */
  const ruleMarked = $derived.by(() => {
    const own = typeof rule === 'object' ? rule : {};
    const color =
      own.stroke ??
      stroke ??
      scene.style(joined(classes.root, classes.rule, own.class))?.stroke ??
      defaultStroke;
    const { edgeX, edgeY } = edges;
    if (placement === 'angle') {
      const start = Math.min(...(ctx.xRange as number[]).map(Number));
      const [x1, y1] = pointRadial(start, radii[0]);
      const [x2, y2] = pointRadial(start, radii[1]);
      return [{ points: [x1, 0, y1, x2, 0, y2], color }];
    }
    if (along === 'x' && !radial) return [{ points: [0, 0, edgeY, ctx.width, 0, edgeY], color }];
    if (along === 'y' && !radial) return [{ points: [edgeX, 0, ctx.height, edgeX, 0, 0], color }];
    return [];
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

{#if ruleMarkers}
  {#await import('../Line/Line.markers.svelte') then { default: LineMarkers }}
    <LineMarkers {...ruleMarkers} lines={() => ruleMarked} />
  {/await}
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
