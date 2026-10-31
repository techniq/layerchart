<script lang="ts" module>
  import type { autoTickFormat, TicksConfig } from 'layerchart';

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
     * Pixels between the plot box's edge and the tick labels.
     *
     * @default 14
     */
    tickLabelOffset?: number;
    /** Class added to each tick label */
    class?: string;
  };
</script>

<script lang="ts">
  import { autoTickFormat as tickFormat, autoTickVals, getChartContext } from 'layerchart';

  import { getSceneContext, type SceneLabel } from '../../contexts/scene.svelte.js';
  import { scaled } from '../../utils/marks.js';

  let {
    placement,
    label,
    ticks,
    format,
    tickLabelOffset = 14,
    class: className,
  }: AxisProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();

  const scale = $derived(
    placement === 'bottom' ? ctx.xScale : placement === 'left' ? ctx.yScale : ctx.zScale
  );
  const length = $derived(
    placement === 'bottom' ? ctx.width : placement === 'left' ? ctx.height : ctx.zDepth
  );
  const count = $derived(Math.max(2, Math.round(length / 60)));
  const values = $derived(autoTickVals(scale, ticks, count));
  const formatTick = $derived(tickFormat({ scale, ticks, count, formatType: format }));

  const labels = $derived.by((): SceneLabel[] => {
    const w = ctx.width;
    const h = ctx.height;
    const offset = tickLabelOffset;
    // The floor's edges nearest the camera, and which way is out from the plot box
    const nearX = scene.far.x === 'min' ? w : 0;
    const nearY = scene.far.y === 'min' ? h : 0;
    const outX = nearX === w ? 1 : -1;
    const outY = nearY === h ? 1 : -1;
    // `z` stands up the corner where the wall behind on `x` meets the front
    const farX = w - nearX;

    const at = (value: unknown): [number, number, number] => {
      const p = scaled(scale, value);
      if (placement === 'bottom') return [p, nearY + outY * offset, 0];
      if (placement === 'left') return [nearX + outX * offset, p, 0];
      return [farX - outX * offset, nearY + outY * offset, p];
    };

    const result: SceneLabel[] = values.map((value, i) => {
      const [x, y, z] = at(value);
      return {
        key: `${placement}-${i}`,
        x,
        y,
        z,
        text: String(formatTick(value, i)),
        class: className,
      };
    });

    if (label) {
      const titleOffset = offset * 3;
      const [x, y, z] =
        placement === 'bottom'
          ? [w / 2, nearY + outY * titleOffset, 0]
          : placement === 'left'
            ? [nearX + outX * titleOffset, h / 2, 0]
            : [farX - outX * titleOffset, nearY + outY * titleOffset, ctx.zDepth / 2];
      result.push({
        key: `${placement}-label`,
        x,
        y,
        z,
        text: label,
        class: 'lc-scene-axis-label',
      });
    }
    return result;
  });

  $effect(() => scene.addLabels(() => labels));
</script>
