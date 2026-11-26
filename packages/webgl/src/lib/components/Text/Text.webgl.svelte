<script lang="ts" module>
  import type { DataProp } from 'layerchart';
  import type { TextProps } from './Text.shared.svelte.js';
</script>

<script lang="ts">
  import { Group, Mesh, Vector3 } from 'three';

  import {
    extractRawDataValue,
    getChartContext,
    getStringWidth,
    isDataProp,
    truncateText,
  } from 'layerchart';
  import { format as formatValue } from '@layerstack/utils';

  import {
    getParent,
    getSceneContext,
    isUnclipped,
    type SceneLabel,
  } from '../../contexts/scene.svelte.js';
  import { getSphere } from '../../utils/globe.js';
  import { disposeLabel, fontFamily, labelPlane } from '../../utils/labels.js';
  import { markRows, placeOf, rowColor } from '../../utils/marks.js';
  import { valueOf } from '../../utils/values.js';

  let {
    data,
    value,
    x,
    y,
    z,
    viewport = false,
    textAnchor = 'middle',
    verticalAnchor = 'end',
    dx = 0,
    dy = 0,
    format,
    width,
    lineHeight,
    truncate = false,
    scaleToFit = false,
    fontSize: fontSizeProp,
    fontWeight: fontWeightProp,
    rotate = 0,
    fill: fillProp,
    stroke: strokeProp,
    strokeWidth: strokeWidthProp,
    class: className,
  }: TextProps = $props();

  /** Labels lying on the surface: as asked, else the text color */
  const fill = $derived(fillProp ?? 'var(--color-surface-content, currentColor)');
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
  const look = $derived(scene.style(className));
  const stroke = $derived(strokeProp ?? look?.stroke ?? undefined);
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);
  /** Its objects, stacked with other marks' in the order they're declared */
  const layer = scene.layer();
  const sphere = $derived(getSphere(ctx));

  /** With rows (`data`, or `x` / `y` reading the chart's), as the core `Text` */
  const dataMode = $derived(data != null || isDataProp(x) || isDataProp(y));
  const xProp = $derived(x ?? (dataMode ? (ctx.config.x as DataProp) : undefined));
  const yProp = $derived(y ?? (dataMode ? (ctx.config.y as DataProp) : undefined));
  const zProp = $derived(z ?? (dataMode ? (ctx.config.z as DataProp) : undefined));

  const rows = $derived(
    (dataMode ? markRows(ctx, data, xProp, yProp) : [undefined]).flatMap((d) => {
      const text =
        typeof value === 'function'
          ? value(d)
          : typeof value === 'string' && dataMode
            ? extractRawDataValue(value, d)
            : value;
      if (text == null || text === '') return [];
      const [px, height, py] = placeOf(ctx, sphere, xProp, yProp, zProp, d);
      return [{ d, text: shorten(formatted(text), d), x: px, y: py, z: height }];
    })
  );

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

  // Facing the viewer: drawn over the scene, so text stays crisp and upright however it turns
  const labels = $derived(
    viewport
      ? rows.map(
          ({ d, text, x, y, z }, i): SceneLabel => ({
            key: String(i),
            // Moved with the `Group` it's in, which moves what's in the scene
            x: x + (parent?.x ?? 0),
            y: y + (parent?.y ?? 0),
            z,
            text,
            class: className,
            // Only as asked, so a `class` coloring them (ex. `text-red-500`) still does
            color: fillProp == null ? undefined : rowColor(ctx, fillProp, d, 'currentColor'),
            stroke: stroke == null ? undefined : rowColor(ctx, stroke, d, 'currentColor'),
            strokeWidth: stroke == null ? undefined : strokeWidth,
            clip: true,
            dx,
            dy,
            textAnchor,
            verticalAnchor,
            width: truncate || scaleToFit ? undefined : width,
          })
        )
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
        let size = valueOf(fontSize, d);
        if (scaleToFit && width) {
          const natural = getStringWidth(text, {
            fontSize: `${size}px`,
            fontWeight: String(fontWeight),
          } as CSSStyleDeclaration);
          if (natural && natural > width) size *= width / natural;
        }
        const wrapAt = width && !truncate && !scaleToFit ? width : undefined;
        const color = scene.color(
          rowColor(ctx, fill, d, 'var(--color-surface-content, currentColor)')
        );
        const halo = stroke == null ? null : scene.color(rowColor(ctx, stroke, d, 'currentColor'));
        const key = [
          text,
          size,
          fontWeight,
          color?.color.getHexString(),
          color?.opacity,
          halo?.color.getHexString(),
          halo?.opacity,
          halo ? strokeWidth : 0,
          wrapAt,
          lineSpacing,
          textAnchor,
        ].join('\u0000');
        let label = previous.get(key)?.shift();
        if (!label) {
          const made = labelPlane(text, {
            fontSize: size,
            fontWeight,
            color,
            stroke: halo,
            strokeWidth,
            family,
            maxWidth: wrapAt,
            lineHeight: lineSpacing,
            align: textAnchor,
          });
          if (!made) continue;
          // Lying face up, reading along `x` with its top towards the plot's far side
          made.mesh.geometry.rotateX(-Math.PI / 2);
          group.add(made.mesh);
          label = made;
        }
        const { mesh: plane, width: across, height: tall, baseline, lines } = label;
        // Lifted a little off what it lies on, and by its anchors along its baseline and its up
        // (towards the plot's far side, unturned): kept on the same side of its point when it turns
        // half round to read the right way
        const turn = (-valueOf(rotate, d) * Math.PI) / 180;
        const along = ((textAnchor === 'start' ? 1 : textAnchor === 'end' ? -1 : 0) * across) / 2;
        // Its first baseline below its point, as the core `Text` places it: its cap height's top
        // (`start`), middle (`middle`, across all its lines), or its last baseline (`end`)
        // Resolved as the core `Text` resolves its `0.71em`: by a `fontSize` given it, else by
        // 16px (not a `class`'s size), so a label lines up where it does in an SVG layer
        const cap = CAP_HEIGHT * (fontSizeProp != null ? valueOf(fontSizeProp, d) : 16);
        const leading = size * lineSpacing;
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
        next.set(key, [...(next.get(key) ?? []), label]);
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
