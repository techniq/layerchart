<script lang="ts" module>
  import type { Snippet } from 'svelte';

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
</script>

<script lang="ts">
  import { getChartContext } from './Chart-Next.svelte';

  import RectClipPath from './RectClipPath.svelte';

  let {
    full = false,
    disabled = false,
    children,
    ...restProps
  }: ChartClipPathPropsWithoutHTML = $props();

  const ctx = getChartContext();
</script>

<RectClipPath
  x={full && ctx.padding.left ? -ctx.padding.left : 0}
  y={full && ctx.padding.top ? -ctx.padding.top : 0}
  width={ctx.width + (full ? (ctx.padding?.left ?? 0) + (ctx.padding?.right ?? 0) : 0)}
  height={ctx.height + (full ? (ctx.padding?.top ?? 0) + (ctx.padding?.bottom ?? 0) : 0)}
  {disabled}
  {...restProps}
>
  {@render children?.()}
</RectClipPath>
