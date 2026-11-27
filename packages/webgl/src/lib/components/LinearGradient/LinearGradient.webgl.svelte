<script lang="ts">
  import { getChartContext, type LinearGradientProps } from 'layerchart';
  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { registerPaint, type LinearGradientPaint } from '../../utils/paint.svelte.js';

  const uid = $props.id();

  let {
    id = `linearGradient--${uid}`,
    stops = ['var(--tw-gradient-from)', 'var(--tw-gradient-to)'],
    vertical = false,
    x1 = '0%',
    y1 = '0%',
    x2 = vertical ? '0%' : '100%',
    y2 = vertical ? '100%' : '0%',
    rotate,
    units = 'objectBoundingBox',
    class: className,
    children,
  }: LinearGradientProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();

  // The marks inside (or any naming `url(#id)`) draw with it, as SVG's `<linearGradient>`
  const paint: LinearGradientPaint = {
    type: 'linear',
    get stops() {
      return stops;
    },
    get classes() {
      return typeof className === 'string' ? className : undefined;
    },
    get x1() {
      return x1;
    },
    get y1() {
      return y1;
    },
    get x2() {
      return x2;
    },
    get y2() {
      return y2;
    },
    get rotate() {
      return rotate;
    },
    get units() {
      return units;
    },
    get viewport() {
      return { width: ctx.containerWidth, height: ctx.containerHeight };
    },
  };
  registerPaint(scene, () => id, paint);
</script>

<!-- A gradient the scene's marks paint with `url(#id)`, as the core `LinearGradient`'s SVG one -->
{@render children?.({ id, gradient: `url(#${id})` })}
