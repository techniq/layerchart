<script lang="ts" module>
  export type {
    PatternProps,
    PatternPropsWithoutHTML,
  } from './Pattern.shared.svelte.js';
</script>

<script lang="ts">
  import { asAny } from '$lib/utils/types.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { createPattern } from '$lib/utils/canvas.js';
  import { createId } from '$lib/utils/createId.js';
  import { buildPatternShapes, type PatternProps } from './Pattern.shared.svelte.js';

  const chartCtx = getChartContext();
  const uid = $props.id();

  let {
    id = createId('pattern-', uid),
    size = 4,
    width = size,
    height = size,
    lines: linesProp,
    circles: circlesProp,
    background,
    children,
  }: PatternProps = $props();

  const shapes = $derived(buildPatternShapes(linesProp, circlesProp, size, width, height));

  let canvasPattern = $state<CanvasPattern | null>(null);

  function render(_ctx: CanvasRenderingContext2D) {
    const pattern = createPattern(_ctx, width, height, shapes, background);
    canvasPattern = pattern;
  }

  chartCtx.registerComponent({
    name: 'Pattern',
    kind: 'group',
    canvasRender: {
      render,
      deps: () => [width, height, shapes, background],
    },
  });
</script>

{@render children?.({ id, pattern: asAny(canvasPattern) })}
