<script lang="ts" module>
  import type { Without } from '$lib/utils/types.js';
  import Rect, { type RectProps, type RectPropsWithoutHTML } from './Rect.svelte';

  export type FramePropsWithoutHTML = RectPropsWithoutHTML & {
    /**
     * Whether to include padding area
     *
     * @default false
     */
    full?: boolean;
  };

  export type FrameProps = Omit<
    FramePropsWithoutHTML & Without<RectProps, FramePropsWithoutHTML>,
    'width' | 'height'
  >;
</script>

<script lang="ts">
  import { getChartContext } from './Chart.svelte';
  import { createDataAttr } from '$lib/utils/attributes.js';

  let { ref = $bindable(), full = false, ...restProps }: FrameProps = $props();

  const ctx = getChartContext();
</script>

<Rect
  {...createDataAttr('frame')}
  x={full && ctx.padding?.left ? -ctx.padding.left : 0}
  y={full && ctx.padding?.top ? -ctx.padding.top : 0}
  width={ctx.width + (full ? (ctx.padding?.left ?? 0) + (ctx.padding?.right ?? 0) : 0)}
  height={ctx.height + (full ? (ctx.padding?.top ?? 0) + (ctx.padding?.bottom ?? 0) : 0)}
  bind:ref
  {...restProps}
/>
