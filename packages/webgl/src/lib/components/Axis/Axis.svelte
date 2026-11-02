<script lang="ts" module>
  import type { autoTickFormat, TicksConfig } from 'layerchart';

  /** How an axis draws its labels, as `Text` draws them */
  export type AxisLabelProps = {
    /**
     * Face the viewer, drawn over the scene upright and crisp, rather than on the plot box: the
     * floor's labels (`bottom`, `left`) lie on it, as an `isometric` chart's do, and the height
     * axis' (`back`) stand on the back wall beside its edge, turning with it.
     *
     * @default false
     */
    viewport?: boolean;
    /** Class added to each `viewport` label */
    class?: string;
    /**
     * Font size in pixels of the plot, for labels on the plot box.  Defaults to read about as
     * large as `viewport` labels as the view is fitted.
     */
    fontSize?: number;
    /** Font weight, for labels on the plot box */
    fontWeight?: number | string;
    /** CSS color, for labels on the plot box */
    fill?: string;
  };

  export type AxisProps = {
    /**
     * Which axis: `bottom` labels `x` along the floor's front edge, `left` labels `y` along its
     * side, and `back` labels `z` up a corner.  Same as an `isometric` chart's.  The edges turn
     * to stay in front as the camera orbits.
     */
    placement: 'bottom' | 'left' | 'back';
    /** Title drawn beyond the tick labels */
    label?: string;
    /** A count, values, or an interval */
    ticks?: TicksConfig;
    /** How to format tick values */
    format?: Parameters<typeof autoTickFormat>[0]['formatType'];
    /**
     * Draw a line along the axis' edge of the plot box.
     *
     * @default false
     */
    rule?: boolean;
    /**
     * Draw a mark out from the edge at each tick.
     *
     * @default true
     */
    tickMarks?: boolean;
    /**
     * How far tick marks reach out from the edge, in pixels.
     *
     * @default 4
     */
    tickLength?: number;
    /**
     * Pixels between the plot box's edge and the tick labels.
     *
     * @default tickLength + 2
     */
    tickLabelOffset?: number;
    /** How the tick labels are drawn */
    tickLabelProps?: AxisLabelProps;
    /** How `label` is drawn */
    labelProps?: AxisLabelProps;
  };
</script>

<script lang="ts">
  import { autoTickFormat as tickFormat, autoTickVals, getChartContext } from 'layerchart';

  import { getSceneContext, setUnclipped, type SceneLabel } from '../../contexts/scene.svelte.js';
  import { scaled, TICK_SPACING, tickCount } from '../../utils/marks.js';
  import {
    BufferGeometry,
    Float32BufferAttribute,
    Group,
    LineBasicMaterial,
    LineSegments,
    Mesh,
  } from 'three';
  import { disposeLabel, labelPlane } from '../../utils/labels.js';
  import Text from '../Text/Text.svelte';

  let {
    placement,
    label,
    ticks,
    format,
    rule = false,
    tickMarks = true,
    tickLength = 4,
    tickLabelOffset = tickLength + 2,
    tickLabelProps,
    labelProps,
  }: AxisProps = $props();

  const tickViewport = $derived(tickLabelProps?.viewport ?? false);
  const labelViewport = $derived(labelProps?.viewport ?? false);

  const ctx = getChartContext();
  const scene = getSceneContext();
  // Its labels lie beside the plot box, so aren't clipped to it
  setUnclipped();

  const scale = $derived(
    placement === 'bottom' ? ctx.xScale : placement === 'left' ? ctx.yScale : ctx.zScale
  );
  const length = $derived(
    placement === 'bottom' ? ctx.width : placement === 'left' ? ctx.height : ctx.zDepth
  );
  // Spaced as LayerChart's `Axis` spaces them
  const count = $derived(
    tickCount(length, TICK_SPACING[placement === 'bottom' ? 'x' : placement === 'left' ? 'y' : 'z'])
  );
  const values = $derived(autoTickVals(scale, ticks, count));
  const formatTick = $derived(tickFormat({ scale, ticks, count, formatType: format }));

  /** The floor's edges nearest the camera, which way is out from the plot box, and the corner `z` stands up */
  const edges = $derived.by(() => {
    const w = ctx.width;
    const h = ctx.height;
    const nearX = scene.far.x === 'min' ? w : 0;
    const nearY = scene.far.y === 'min' ? h : 0;
    // `z` stands up the corner where the wall behind on `x` meets the front
    return {
      nearX,
      nearY,
      outX: nearX === w ? 1 : -1,
      outY: nearY === h ? 1 : -1,
      farX: w - nearX,
    };
  });

  /** Pixels of the plot that read as one on screen, so marks and gaps keep their size in 3D */
  const unit = $derived(scene.unit);

  const labels = $derived.by((): SceneLabel[] => {
    const w = ctx.width;
    const h = ctx.height;
    const { nearX, nearY, outX, outY, farX } = edges;
    const offset = tickLabelOffset * unit;
    // Labels are placed by their middle: half a label further out, across or down
    const half = (placement === 'left' && !tickViewport ? 0 : 6) * unit;

    const at = (value: unknown): [number, number, number] => {
      const p = scaled(scale, value);
      if (placement === 'bottom') return [p, nearY + outY * (offset + half), 0];
      if (placement === 'left')
        return [nearX + outX * (offset + (tickViewport ? 12 * unit : 0)), p, 0];
      return [farX, nearY + outY * (offset + half), p];
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
      };
    });

    if (label) {
      // Beyond the tick labels
      const titleOffset = offset + 26 * unit;
      const [x, y, z] =
        placement === 'bottom'
          ? [w / 2, nearY + outY * titleOffset, 0]
          : placement === 'left'
            ? [nearX + outX * (titleOffset + 8 * unit), h / 2, 0]
            : [farX, nearY + outY * (titleOffset + 8 * unit), ctx.zDepth / 2];
      result.push({
        key: `${placement}-label`,
        x,
        y,
        z,
        text: label,
        class: ['lc-webgl-axis-label', labelProps?.class].filter(Boolean).join(' '),
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
  // Tick labels as LayerChart's `Axis` draws them: light, in the text color
  const weightOf = (l: SceneLabel) =>
    (isTitle(l) ? labelProps : tickLabelProps)?.fontWeight ?? (isTitle(l) ? 600 : 300);
  const fillOf = (l: SceneLabel) =>
    (isTitle(l) ? labelProps : tickLabelProps)?.fill ??
    'var(--color-surface-content, currentColor)';

  // The rule along the edge and the marks out from it at each tick, as LayerChart's `Axis` draws
  // them (in the scene's axes: chart x, then height, then chart y)
  const lineMaterial = new LineBasicMaterial({ transparent: true, depthWrite: false });
  const lines = new LineSegments(new BufferGeometry(), lineMaterial);
  lines.userData.unclipped = true;
  scene.root.add(lines);
  $effect(() => {
    const w = ctx.width;
    const h = ctx.height;
    const d = ctx.zDepth;
    const { nearX, nearY, outX, outY, farX } = edges;
    const reach = tickLength * unit;
    const segments: number[] = [];
    if (placement === 'bottom') {
      if (rule) segments.push(0, 0, nearY, w, 0, nearY);
      if (tickMarks)
        for (const v of values) {
          const p = scaled(scale, v);
          segments.push(p, 0, nearY, p, 0, nearY + outY * reach);
        }
    } else if (placement === 'left') {
      if (rule) segments.push(nearX, 0, 0, nearX, 0, h);
      if (tickMarks)
        for (const v of values) {
          const p = scaled(scale, v);
          segments.push(nearX, 0, p, nearX + outX * reach, 0, p);
        }
    } else if (d > 0) {
      if (rule) segments.push(farX, 0, nearY, farX, d, nearY);
      if (tickMarks)
        for (const v of values) {
          const p = scaled(scale, v);
          segments.push(farX, p, nearY, farX, p, nearY + outY * reach);
        }
    }
    lines.geometry.dispose();
    lines.geometry = new BufferGeometry();
    lines.geometry.setAttribute('position', new Float32BufferAttribute(segments, 3));
    scene.invalidate();
  });
  $effect(() => {
    const color = scene.color(
      'color-mix(in oklab, var(--color-surface-content, currentColor) 50%, transparent)'
    );
    if (color) {
      lineMaterial.color.copy(color.color);
      lineMaterial.opacity = color.opacity;
    }
    scene.invalidate();
  });
  $effect(() => () => {
    scene.root.remove(lines);
    lines.geometry.dispose();
    lineMaterial.dispose();
  });

  // The height axis' labels stand on the back wall its edge is on, reading along it from the
  // edge outward, so they turn with the walls as the floor's turn with the floor
  const wall = new Group();
  wall.userData.unclipped = true;
  scene.root.add(wall);
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
      for (const l of floorLabels) {
        const label = labelPlane(l.text, {
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
    scene.root.remove(wall);
    scene.invalidate();
  });

  /**
   * A label lying on the floor: the left axis' end at it (away from the plot, on whichever side
   * it's on), the others centered
   */
  function anchorOf(l: SceneLabel): 'start' | 'middle' | 'end' {
    if (placement !== 'left') return 'middle';
    return l.x < ctx.width / 2 ? 'end' : 'start';
  }
</script>

{#if placement !== 'back'}
  {#each floorLabels as l (l.key)}
    <Text
      x={l.x}
      y={l.y}
      z={l.z}
      value={l.text}
      textAnchor={anchorOf(l)}
      fontSize={sizeOf(l)}
      fontWeight={weightOf(l)}
      fill={fillOf(l)}
    />
  {/each}
{/if}
