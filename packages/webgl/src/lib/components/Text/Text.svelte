<script lang="ts" module>
  import type { DataProp, TruncateTextOptions } from 'layerchart';
  import type { FormatConfig, FormatType } from '@layerstack/utils';
  import type { ValueProp } from '../../utils/values.js';

  export type TextProps = {
    /** Rows to draw a label each for.  Falls back to the chart's data when `x` / `y` read rows. */
    data?: any[];
    /** The text: a data property name (with rows), a function of the row, or the text itself */
    value: string | number | ((d: any) => string | number | null | undefined);
    /**
     * Across the plot: a data property name or function of the row through the chart's `x` scale
     * (longitude on a map), or pixels.  Defaults to the chart's `x` with rows.
     */
    x?: DataProp;
    /**
     * Down the plot: a data property name or function of the row through the chart's `y` scale
     * (latitude on a map), or pixels.  Defaults to the chart's `y` with rows.
     */
    y?: DataProp;
    /**
     * Height off the floor: a data property name or function of the row through the chart's `z`
     * scale, or pixels.  Defaults to the chart's `z` with rows, else `0`.
     */
    z?: DataProp;
    /**
     * Keep each label facing the viewer, drawn over the scene upright and crisp however the view
     * turns (styled with `class`).  Otherwise it lies on the surface at its height (ex. the tops
     * of boxes), turning and tipping with the view, and hidden behind whatever's nearer.
     *
     * @default false
     */
    viewport?: boolean;
    /**
     * Which end of a label is at its point: its `start`, `middle`, or `end` as it reads.  Lying on
     * the surface, it stays on that side of the point as the view turns.
     *
     * @default 'middle'
     */
    textAnchor?: 'start' | 'middle' | 'end';
    /**
     * Which edge of a label is at its point: its top (`start`), `middle`, or bottom (`end`) as it
     * reads.
     *
     * @default 'middle'
     */
    verticalAnchor?: 'start' | 'middle' | 'end';
    /** Pixels to move each label across: on screen with `viewport`, else across the plot */
    dx?: number;
    /** Pixels to move each label down: on screen with `viewport`, else down the plot */
    dy?: number;
    /** How to format a number or date `value` (as LayerChart's `format`) */
    format?: FormatType | FormatConfig;
    /** Wrap words onto more lines to keep each label within this many pixels */
    width?: number;
    /** Line spacing of wrapped labels, in multiples of the font size (or `'1.2em'`) */
    lineHeight?: number | string;
    /** Shorten each label with an ellipsis to fit `width` (or as the options say) */
    truncate?: boolean | TruncateTextOptions;
    /** Shrink a label lying on the surface to fit `width`, rather than wrapping it */
    scaleToFit?: boolean;
    /**
     * Font size in pixels of the plot, for labels lying on the surface.
     *
     * @default 12
     */
    fontSize?: ValueProp<number>;
    /**
     * Font weight, for labels lying on the surface.
     *
     * @default 600
     */
    fontWeight?: number | string;
    /**
     * Which way labels lying on the surface run, in degrees clockwise from left to right across the plot.
     * Turned half round whenever they'd read backwards from where the view is.
     *
     * @default 0
     */
    rotate?: ValueProp<number>;
    /**
     * The CSS color of labels lying on the surface.
     *
     * @default 'var(--color-surface-content)'
     */
    fill?: ValueProp<string>;
    /** Class added to each `viewport` label */
    class?: string;
  };
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

  import { getSceneContext, isUnclipped, type SceneLabel } from '../../contexts/scene.svelte.js';
  import { getSphere } from '../../utils/globe.js';
  import { disposeLabel, fontFamily, labelPlane } from '../../utils/labels.js';
  import { markRows, placeOf } from '../../utils/marks.js';
  import { valueOf } from '../../utils/values.js';

  let {
    data,
    value,
    x,
    y,
    z,
    viewport = false,
    textAnchor = 'middle',
    verticalAnchor = 'middle',
    dx = 0,
    dy = 0,
    format,
    width,
    lineHeight,
    truncate = false,
    scaleToFit = false,
    fontSize = 12,
    fontWeight = 600,
    rotate = 0,
    fill = 'var(--color-surface-content, currentColor)',
    class: className,
  }: TextProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  const sphere = $derived(getSphere(ctx));

  /** With rows (`data`, or `x` / `y` reading the chart's), as LayerChart's `Text` */
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

  /** A number or date as `format` says, as LayerChart's `Text` formats its `value` */
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
          ({ text, x, y, z }, i): SceneLabel => ({
            key: String(i),
            x,
            y,
            z,
            text,
            class: className,
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
  scene.root.add(group);
  /** Each plane's turn as given, before any half turn to read the right way round */
  const turns = new Map<Mesh, number>();
  /**
   * The planes drawn, by their text and how it's painted, with their widths: a label that only
   * moves (ex. an axis' tick labels as the chart pans) keeps its plane rather than painting a new
   * canvas and texture
   */
  let painted = new Map<string, { mesh: Mesh; width: number; height: number }[]>();

  $effect(() => {
    const previous = painted;
    const next = new Map<string, { mesh: Mesh; width: number; height: number }[]>();
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
        const color = scene.color(valueOf(fill, d));
        const key = [
          text,
          size,
          fontWeight,
          color?.color.getHexString(),
          color?.opacity,
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
        const { mesh: plane, width: across, height: tall } = label;
        // Lifted a little off what it lies on, and by its anchors along its baseline and its up
        // (towards the plot's far side, unturned): kept on the same side of its point when it turns
        // half round to read the right way
        const turn = (-valueOf(rotate, d) * Math.PI) / 180;
        const along = ((textAnchor === 'start' ? 1 : textAnchor === 'end' ? -1 : 0) * across) / 2;
        const rise =
          ((verticalAnchor === 'start' ? -1 : verticalAnchor === 'end' ? 1 : 0) * tall) / 2;
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
      scene.root.remove(group);
      scene.invalidate();
    };
  });
</script>
