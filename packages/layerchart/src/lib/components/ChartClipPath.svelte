<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { Without } from '$lib/utils/types.js';

  export type ChartClipPathPropsWithoutHTML = {
    /**
     * Include padding area (ex. axis)
     *
     * @default false
     */
    full?: boolean;

    /**
     * Disable clipping (show all)
     *
     * @default false
     */
    disabled?: boolean;

    children?: Snippet;
  };

  export type ChartClipPathProps = ChartClipPathPropsWithoutHTML &
    Without<Omit<RectClipPathProps, 'width' | 'height'>, ChartClipPathPropsWithoutHTML>;
</script>

<script lang="ts">
  import { getChartContext } from './Chart.svelte';

  import RectClipPath, { type RectClipPathProps } from './RectClipPath.svelte';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  let { full = false, disabled = false, ...restProps }: ChartClipPathProps = $props();

  const ctx = getChartContext();
</script>

<RectClipPath
  x={full && ctx.padding.left ? -ctx.padding.left : 0}
  y={full && ctx.padding.top ? -ctx.padding.top : 0}
  {disabled}
  height={ctx.height + (full ? (ctx.padding?.top ?? 0) + (ctx.padding?.bottom ?? 0) : 0)}
  width={ctx.width + (full ? (ctx.padding?.left ?? 0) + (ctx.padding?.right ?? 0) : 0)}
  {...extractLayerProps(restProps, 'chart-clip-path')}
/>
