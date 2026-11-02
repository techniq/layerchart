<script lang="ts" module>
  import type { DataProp } from 'layerchart';
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
     * Which end of a label lying on the surface is at its point: its `start`, `middle`, or `end`
     * as it reads.  It stays on that side of the point as the view turns.
     *
     * @default 'middle'
     */
    textAnchor?: 'start' | 'middle' | 'end';
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

  import { extractRawDataValue, getChartContext, isDataProp } from 'layerchart';

  import { getSceneContext, isUnclipped, type SceneLabel } from '../../contexts/scene.svelte.js';
  import { getSphere } from '../../utils/globe.js';
  import { disposeLabel, labelPlane } from '../../utils/labels.js';
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
      return [{ d, text: String(text), x: px, y: py, z: height }];
    })
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

  $effect(() => {
    const planes: Mesh[] = [];
    turns.clear();
    if (!viewport) {
      for (const { d, text, x: px, y: py, z: up } of rows) {
        const label = labelPlane(text, {
          fontSize: valueOf(fontSize, d),
          fontWeight,
          color: scene.color(valueOf(fill, d)),
        });
        if (!label) continue;
        const { mesh: plane, width } = label;
        // Lying face up, reading along `x` with its top towards the plot's far side
        plane.geometry.rotateX(-Math.PI / 2);
        // Lifted a little off what it lies on, and along its baseline by its anchor: kept on the
        // same side of its point when it turns half round to read the right way
        const turn = (-valueOf(rotate, d) * Math.PI) / 180;
        const along = ((textAnchor === 'start' ? 1 : textAnchor === 'end' ? -1 : 0) * width) / 2;
        plane.position.set(px + Math.cos(turn) * along, up + 0.3, py - Math.sin(turn) * along);
        turns.set(plane, turn);
        planes.push(plane);
      }
      if (planes.length) group.add(...planes);
    }
    turnToReader();
    scene.invalidate();

    return () => {
      for (const plane of planes) {
        group.remove(plane);
        disposeLabel(plane);
      }
    };
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
      scene.root.remove(group);
      scene.invalidate();
    };
  });
</script>
