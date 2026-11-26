<script lang="ts" module>
  import type { DataProp } from 'layerchart';
  import type { TextProps } from './Text.shared.svelte.js';
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { Group, Mesh, Vector3, type MeshLambertMaterial } from 'three';

  import {
    extractRawDataValue,
    getChartContext,
    getStringWidth,
    isDataProp,
    truncateText,
  } from 'layerchart';
  import { format as formatValue } from '@layerstack/utils';
  import { createMotion, type MotionOptions } from 'layerchart/utils/motion.svelte';

  import {
    getParent,
    getSceneContext,
    isUnclipped,
    type SceneLabel,
  } from '../../contexts/scene.svelte.js';
  import type { ClassStyle, ResolvedColor } from '../../utils/color.js';
  import { getSphere } from '../../utils/globe.js';
  import { disposeLabel, fontFamily, labelPlane } from '../../utils/labels.js';
  import { markRows, placeOf, rowColor } from '../../utils/marks.js';
  import { valueOf } from '../../utils/values.js';
  import { pointAlong } from '../../utils/path.js';
  import { createRowMotion } from '../../utils/rowMotion.svelte.js';

  let {
    data,
    value,
    segments,
    x: xGiven,
    initialX,
    y: yGiven,
    initialY,
    z,
    viewport = false,
    textAnchor = 'middle',
    verticalAnchor: verticalAnchorProp = 'end',
    dx = 0,
    dy = 0,
    format,
    width,
    lineHeight,
    truncate = false,
    scaleToFit = false,
    fontSize: fontSizeProp,
    capHeight,
    fontWeight: fontWeightProp,
    rotate: rotateProp = 0,
    path,
    startOffset,
    dominantBaseline,
    fill: fillProp,
    stroke: strokeProp,
    strokeWidth: strokeWidthProp,
    fillOpacity,
    strokeOpacity,
    opacity,
    class: className,
    motion,
    key = (_d: any, i: number) => i,
    ...rest
  }: TextProps & Record<`data-${string}`, unknown> = $props();

  /** Its `data-*` attributes, which LayerChart's styles read (ex. `Labels`' `data-placement`) */
  const dataAttributes = $derived.by(() => {
    const entries = Object.entries(rest).filter(
      ([name, value]) => name.startsWith('data-') && value != null
    );
    return entries.length
      ? Object.fromEntries(entries.map(([name, value]) => [name, String(value)]))
      : undefined;
  });

  /**
   * Along a `path` (ex. an arc's edge, from `Arc`'s `getArcTextProps('outer')`): at its
   * `startOffset`, turned the way the path runs there, as an SVG `textPath` places text (straight,
   * rather than bent along it)
   */
  const along = $derived(path ? pointAlong(path, startOffset) : null);
  const x = $derived(along ? along.x : xGiven);
  const y = $derived(along ? along.y : yGiven);
  const rotate = $derived(along ? along.angle : rotateProp);
  /** Its baseline on the path, as `dominantBaseline` says, else as `verticalAnchor` does */
  const verticalAnchor = $derived(
    along && dominantBaseline
      ? dominantBaseline === 'hanging' || dominantBaseline === 'text-before-edge'
        ? 'start'
        : dominantBaseline === 'middle' || dominantBaseline === 'central'
          ? 'middle'
          : 'end'
      : verticalAnchorProp
  );
  const ctx = getChartContext();
  const scene = getSceneContext();
  /** A font's cap height in its size, as the core `Text` takes it (`0.71em`) */
  const CAP_HEIGHT = 0.71;
  const parent = getParent();
  /** As asked, else as its `class` (or the chart) sets them, as an SVG or Canvas label */
  const font = $derived(scene.font(className));
  const fontSize = $derived(fontSizeProp ?? font?.size ?? 12);
  const fontWeight = $derived(fontWeightProp ?? font?.weight ?? 400);
  /**
   * Its halo: its own `stroke`, or the one its `class` sets (ex. `stroke-surface-100
   * [stroke-width:3px]`), as an SVG label's stroke
   */
  const look = $derived(scene.style(className, dataAttributes));
  // A class's own stroke wins over the prop, as CSS does in core's layers
  const stroke = $derived(
    (look?.strokeSet ? look.stroke : null) ?? strokeProp ?? look?.stroke ?? undefined
  );
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);
  /** An opacity prop for row `d`, unset when it isn't given (or gives none for the row) */
  const opacityOf = (prop: typeof opacity, d: any) => (prop == null ? undefined : valueOf(prop, d));
  /** Its objects, stacked with other marks' in the order they're declared */
  const layer = scene.layer();
  const sphere = $derived(getSphere(ctx));

  /** With rows (`data`, or `x` / `y` reading the chart's), as the core `Text` */
  const dataMode = $derived(data != null || isDataProp(x) || isDataProp(y));
  const xProp = $derived(x ?? (dataMode ? (ctx.config.x as DataProp) : undefined));
  const yProp = $derived(y ?? (dataMode ? (ctx.config.y as DataProp) : undefined));
  const zProp = $derived(z ?? (dataMode ? (ctx.config.z as DataProp) : undefined));

  /**
   * A numeric `value` tweened to each new one, as the core `Text` (in pixel mode, with a motion
   * `{ type }`); otherwise passed through as it is
   */
  const tweensValue = untrack(
    () =>
      typeof value === 'number' && typeof motion === 'object' && motion != null && 'type' in motion
  );
  const shownValue = createMotion(
    untrack(() => (typeof value === 'number' ? value : 0)),
    () => (typeof value === 'number' ? value : 0),
    tweensValue ? (untrack(() => motion) as MotionOptions) : undefined
  );

  /** `segments`' text in their own styles: each one's classes over the label's own */
  const pieces = $derived(
    segments?.map((segment) => {
      const classes = [className, segment.class].filter(Boolean).join(' ');
      return { text: String(segment.value), classes };
    }) ?? null
  );

  /** Each row's label as asked: its text and place */
  const targets = $derived(
    (dataMode ? markRows(ctx, data, xProp, yProp) : [undefined]).flatMap((d, i) => {
      const text = pieces
        ? pieces.map((piece) => piece.text).join('')
        : typeof value === 'number' && tweensValue && !dataMode
          ? shownValue.current
          : typeof value === 'function'
            ? value(d)
            : typeof value === 'string' && dataMode
              ? extractRawDataValue(value, d)
              : value;
      if (text == null || text === '') return [];
      const [px, height, py] = placeOf(ctx, sphere, xProp, yProp, zProp, d);
      return [
        {
          d,
          key: key(d, i),
          // Segments as they are, as the core `Text` (neither formatted nor shortened)
          text: pieces ? String(text) : shorten(formatted(text), d),
          x: px,
          y: py,
          z: height,
        },
      ];
    })
  );

  // Easing to where they're asked to be, as the core `Text`, each by its `key`: a new one from
  // `initialX` / `initialY` (pixel mode, as core's)
  const motionMap = createRowMotion(
    untrack(() => motion),
    ['x', 'y'] as const
  );
  const initial = $derived(dataMode ? undefined : { x: initialX, y: initialY });
  if (motionMap) {
    $effect(() => {
      const from = initial;
      const active = new Set<unknown>();
      for (const t of targets) {
        active.add(t.key);
        const values = { x: t.x, y: t.y };
        untrack(() => motionMap.update(t.key, values, from));
      }
      untrack(() => motionMap.cleanup(active));
    });
  }

  /** Each row's label where it is now (a new one where it eases in from, until it starts) */
  const rows = $derived(
    motionMap
      ? targets.map((t) => {
          const now = motionMap.get(t.key) ?? initial;
          return { ...t, x: now?.x ?? t.x, y: now?.y ?? t.y };
        })
      : targets
  );

  /** `color` with its alpha multiplied by `opacity`, when one is given */
  function faded(color: ResolvedColor | null, opacity: number | undefined) {
    return color && opacity != null ? { ...color, opacity: color.opacity * opacity } : color;
  }

  /** A number or date as `format` says, as the core `Text` formats its `value` */
  function formatted(text: unknown) {
    if (format == null || typeof text === 'string') return String(text);
    return formatValue(text as any, format as any);
  }

  /** Shortened with an ellipsis to fit, as `truncate` says */
  function shorten(text: string, d: any) {
    if (!truncate) return text;
    const options = typeof truncate === 'object' ? truncate : {};
    const size = viewport ? 10 : valueOf(fontSize, d);
    return truncateText(text, {
      maxWidth: width,
      ...options,
      style: { fontSize: `${size}px`, fontWeight: String(fontWeight) } as CSSStyleDeclaration,
    });
  }

  /** `lineHeight` in multiples of the font size */
  const lineSpacing = $derived(
    typeof lineHeight === 'number' ? lineHeight : lineHeight ? parseFloat(lineHeight) || 1.2 : 1.2
  );

  /** A context to measure text with, made when first needed */
  let measurer: CanvasRenderingContext2D | null = null;
  /** How far `text` runs in pixels at a font size and weight (its spaces counted) */
  function measure(text: string, size: number, weight: number | string) {
    if (typeof document === 'undefined') return 0;
    measurer ??= document.createElement('canvas').getContext('2d');
    if (!measurer) return 0;
    measurer.font = `${weight} ${size}px ${fontFamily()}`;
    return measurer.measureText(text).width;
  }

  /**
   * A label's (or segment's) font size, weight, and look lying on the surface: a segment's
   * classes win where they set their own (ex. `font-bold`), else the label's as asked
   */
  function partStyle(classes: string | null, d: any) {
    const size = valueOf(fontSize, d);
    if (classes == null) return { size, weight: fontWeight, look };
    const own = scene.font(classes);
    return {
      size: own && font && own.size !== font.size ? own.size : size,
      weight: own && font && own.weight !== font.weight ? own.weight : fontWeight,
      look: scene.style(classes, dataAttributes),
    };
  }

  /**
   * A segment's font facing the viewer: what its classes set, else the labels' own (as
   * `WebGL`'s styles draw them, 10px and light)
   */
  function viewportFont(classes: string) {
    const base = scene.font(null);
    const own = scene.font(classes);
    return {
      size: own && base && own.size !== base.size ? own.size : 10,
      weight: own && base && own.weight !== base.weight ? own.weight : 300,
    };
  }

  /**
   * Its cap height, as the core `Text` resolves it: `capHeight` (pixels, or `'0.71em'` of 16px),
   * else `0.71` of a `fontSize` given it, else of 16px (not a `class`'s size), so a label lines up
   * where it does in an SVG layer
   */
  function capOf(d: any) {
    if (capHeight != null) return pixels(capHeight);
    return CAP_HEIGHT * (fontSizeProp != null ? valueOf(fontSizeProp, d) : 16);
  }

  /** A CSS length in pixels, as the core `Text` reads one (`em` of 16px) */
  function pixels(value: string | number) {
    if (typeof value === 'number') return value;
    const [, number, unit] = value.match(/([\d.]+)(\D*)/) ?? [];
    const n = Number(number) || 0;
    return unit === 'em' || unit === 'rem' ? n * 16 : n;
  }

  // Facing the viewer: drawn over the scene, so text stays crisp and upright however it turns
  const labels = $derived(
    viewport
      ? rows.flatMap(({ d, text, x, y, z }, i): SceneLabel[] => {
          const label = (partLook: ClassStyle | null) => ({
            // Moved with the `Group` it's in, which moves what's in the scene
            x: x + (parent?.x ?? 0),
            y: y + (parent?.y ?? 0),
            z,
            // Its class's own fill (ex. `fill-black`, as an SVG label's), else only as asked, so
            // a `class` coloring them (ex. `text-red-500`) still does
            color:
              partLook?.fillSet && partLook.fill
                ? partLook.fill
                : fillProp == null
                  ? undefined
                  : rowColor(ctx, fillProp, d, 'currentColor'),
            stroke: stroke == null ? undefined : rowColor(ctx, stroke, d, 'currentColor'),
            strokeWidth: stroke == null ? undefined : strokeWidth,
            fillOpacity: opacityOf(fillOpacity, d),
            strokeOpacity: stroke == null ? undefined : opacityOf(strokeOpacity, d),
            opacity: opacityOf(opacity, d),
            clip: true,
            dy,
            verticalAnchor,
          });
          if (!pieces) {
            return [
              {
                ...label(look),
                key: String(i),
                text,
                class: className,
                dx,
                textAnchor,
                width: truncate || scaleToFit ? undefined : width,
              },
            ];
          }
          // Its segments, each a label of its own in its own classes, laid side by side from
          // where the whole run starts (by how wide each measures in the label's font)
          const fonts = pieces.map((piece) => viewportFont(piece.classes));
          const advances = pieces.map((piece, k) =>
            measure(piece.text, fonts[k].size, fonts[k].weight)
          );
          const total = advances.reduce((sum, advance) => sum + advance, 0);
          let start = -total * (textAnchor === 'start' ? 0 : textAnchor === 'end' ? 1 : 0.5);
          return pieces.flatMap((piece, k) => {
            const from = start;
            start += advances[k];
            const shown = piece.text.trim();
            if (!shown) return [];
            // Leading spaces don't show at the start of a label of its own: past them
            const lead = piece.text.length - piece.text.trimStart().length;
            const indent = lead
              ? measure(piece.text.slice(0, lead), fonts[k].size, fonts[k].weight)
              : 0;
            return [
              {
                ...label(scene.style(piece.classes, dataAttributes)),
                key: `${i}:${k}`,
                text: shown,
                class: piece.classes,
                dx: dx + from + indent,
                textAnchor: 'start' as const,
              },
            ];
          });
        })
      : []
  );

  $effect(() => scene.addLabels(labels));

  // Lying on the surface: each label painted onto a plane at its height
  const group = new Group();
  group.userData.unclipped = isUnclipped();
  layer.add(group);
  /** Each plane's turn as given, before any half turn to read the right way round */
  const turns = new Map<Mesh, number>();
  /**
   * The planes drawn, by their text and how it's painted, with their widths: a label that only
   * moves (ex. an axis' tick labels as the chart pans) keeps its plane rather than painting a new
   * canvas and texture
   */
  let painted = new Map<
    string,
    { mesh: Mesh; width: number; height: number; baseline: number; lines: number }[]
  >();

  $effect(() => {
    const previous = painted;
    const next = new Map<
      string,
      { mesh: Mesh; width: number; height: number; baseline: number; lines: number }[]
    >();
    turns.clear();
    if (!viewport) {
      const family = fontFamily();
      for (const { d, text, x: px, y: py, z: up } of rows) {
        // Its text, else its segments, each a plane of its own laid along its baseline
        const parts = pieces ?? [{ text, classes: null }];
        const single = !pieces;
        const drawn = parts.map((part) => {
          const { size, weight, look: partLook } = partStyle(part.classes, d);
          let scaled = size;
          if (single && scaleToFit && width) {
            const natural = getStringWidth(part.text, {
              fontSize: `${size}px`,
              fontWeight: String(weight),
            } as CSSStyleDeclaration);
            if (natural && natural > width) scaled *= width / natural;
          }
          return { text: part.text, size: scaled, weight, look: partLook };
        });
        /** How far along its baseline each part starts, and their length, for segments */
        const advances = single
          ? []
          : drawn.map((part) => measure(part.text, part.size, part.weight));
        const total = advances.reduce((sum, advance) => sum + advance, 0);
        let start = -total * (textAnchor === 'start' ? 0 : textAnchor === 'end' ? 1 : 0.5);
        drawn.forEach((part, k) => {
          const advance = advances[k] ?? 0;
          const from = start;
          start += advance;
          if (!part.text.trim()) return;
          const wrapAt = single && width && !truncate && !scaleToFit ? width : undefined;
          const align = single ? textAnchor : 'start';
          // Its class's fill (ex. `fill-black`, or a `--fill-color`), as an SVG label's
          const color = faded(
            scene.color(
              rowColor(
                ctx,
                fillProp,
                d,
                'var(--color-surface-content, currentColor)',
                part.look?.fill,
                part.look?.fillSet
              )
            ),
            opacityOf(fillOpacity, d)
          );
          const halo =
            stroke == null
              ? null
              : faded(
                  scene.color(rowColor(ctx, stroke, d, 'currentColor')),
                  opacityOf(strokeOpacity, d)
                );
          const cacheKey = [
            part.text,
            part.size,
            part.weight,
            color?.color.getHexString(),
            color?.opacity,
            halo?.color.getHexString(),
            halo?.opacity,
            halo ? strokeWidth : 0,
            wrapAt,
            lineSpacing,
            align,
          ].join('\u0000');
          let label = previous.get(cacheKey)?.shift();
          if (!label) {
            const made = labelPlane(part.text, {
              fontSize: part.size,
              fontWeight: part.weight,
              color,
              stroke: halo,
              strokeWidth,
              family,
              maxWidth: wrapAt,
              lineHeight: lineSpacing,
              align,
            });
            if (!made) return;
            // Lying face up, reading along `x` with its top towards the plot's far side
            made.mesh.geometry.rotateX(-Math.PI / 2);
            group.add(made.mesh);
            label = made;
          }
          const { mesh: plane, width: across, height: tall, baseline, lines } = label;
          // The whole label faded, its halo and letters together (as an SVG label's `opacity`)
          (plane.material as MeshLambertMaterial).opacity = opacityOf(opacity, d) ?? 1;
          // Lifted a little off what it lies on, and by its anchors along its baseline and its up
          // (towards the plot's far side, unturned): kept on the same side of its point when it
          // turns half round to read the right way.  A segment's plane is centered on its run of
          // text (its margins are even), from where the run starts.
          const turn = (-valueOf(rotate, d) * Math.PI) / 180;
          const along = single
            ? ((textAnchor === 'start' ? 1 : textAnchor === 'end' ? -1 : 0) * across) / 2
            : from + advance / 2;
          // Its first baseline below its point, as the core `Text` places it: its cap height's
          // top (`start`), middle (`middle`, across all its lines), or its last baseline (`end`)
          const cap = capOf(d);
          const leading = part.size * lineSpacing;
          const firstBaseline =
            verticalAnchor === 'start'
              ? cap
              : verticalAnchor === 'middle'
                ? (-(lines - 1) / 2) * leading + cap / 2
                : -(lines - 1) * leading;
          // How far its plane's middle stands up from its point (negative: below it)
          const rise = -(firstBaseline - baseline + tall / 2);
          plane.position.set(
            px + dx + Math.cos(turn) * along - Math.sin(turn) * rise,
            up + 0.3,
            py + dy - Math.sin(turn) * along - Math.cos(turn) * rise
          );
          turns.set(plane, turn);
          next.set(cacheKey, [...(next.get(cacheKey) ?? []), label]);
        });
      }
    }
    // Labels no longer drawn
    for (const labels of previous.values()) {
      for (const { mesh } of labels) {
        group.remove(mesh);
        disposeLabel(mesh);
      }
    }
    painted = next;
    turnToReader();
    scene.invalidate();
  });

  const right = new Vector3();
  /** Turn each label half round when, from where the camera is, it would read right to left */
  function turnToReader() {
    const camera = scene.camera;
    if (camera) right.setFromMatrixColumn(camera.matrixWorld, 0);
    for (const [plane, turn] of turns) {
      // Which way the baseline runs in the scene, against the camera's left to right
      const across = Math.cos(turn) * right.x - Math.sin(turn) * right.z;
      plane.rotation.y = camera && across < 0 ? turn + Math.PI : turn;
    }
  }

  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    scene.cameraVersion;
    turnToReader();
  });

  $effect(() => {
    return () => {
      for (const labels of painted.values()) for (const { mesh } of labels) disposeLabel(mesh);
      layer.remove(group);
      scene.invalidate();
    };
  });
</script>
