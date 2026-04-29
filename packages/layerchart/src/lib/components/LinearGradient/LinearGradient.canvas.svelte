<script lang="ts" module>
  export type {
    LinearGradientProps,
    LinearGradientPropsWithoutHTML,
  } from './LinearGradient.shared.svelte.js';
</script>

<script lang="ts">
  import { asAny } from '$lib/utils/types.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { createLinearGradient, getComputedStyles } from '$lib/utils/canvas.js';
  import { parsePercent } from '$lib/utils/math.js';
  import { createId } from '$lib/utils/createId.js';
  import type { LinearGradientProps } from './LinearGradient.shared.svelte.js';

  const uid = $props.id();

  let {
    id = createId('linearGradient-', uid),
    stops = ['var(--tw-gradient-from)', 'var(--tw-gradient-to)'],
    vertical = false,
    x1 = '0%',
    y1 = '0%',
    x2 = vertical ? '0%' : '100%',
    y2 = vertical ? '100%' : '0%',
    class: className,
    children,
    ...rest
  }: LinearGradientProps = $props();

  const ctx = getChartContext();

  let canvasGradient = $state<CanvasGradient>();

  function render(_ctx: CanvasRenderingContext2D) {
    const _stops = stops.map((stop, i) => {
      if (Array.isArray(stop)) {
        const { fill } = getComputedStyles(_ctx.canvas, {
          styles: { fill: stop[1] },
          classes: className,
        });
        return { offset: parsePercent(stop[0]), color: fill };
      } else {
        const { fill } = getComputedStyles(_ctx.canvas, {
          styles: { fill: stop },
          classes: className,
        });
        return { offset: i / (stops.length - 1), color: fill };
      }
    });

    // TODO: Use x1/y1/x2/y2 values (convert from percentage strings)
    const gradient = createLinearGradient(
      _ctx,
      ctx.padding.left,
      ctx.padding.top,
      vertical ? ctx.padding.left : ctx.width - ctx.padding.right,
      vertical ? ctx.height + ctx.padding.bottom : ctx.padding.top,
      _stops
    );

    canvasGradient = gradient;
  }

  ctx.registerComponent({
    name: 'Gradient',
    kind: 'group',
    canvasRender: {
      render,
      deps: () => [x1, y1, x2, y2, stops, className],
    },
  });
</script>

{@render children?.({ id, gradient: asAny(canvasGradient) })}
