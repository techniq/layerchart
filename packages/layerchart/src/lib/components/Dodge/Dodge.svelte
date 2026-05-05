<script lang="ts" module>
  export type {
    DodgeAnchor,
    DodgeItem,
    DodgeProps,
    DodgePropsWithoutHTML,
  } from './Dodge.shared.svelte.js';
  export { dodge } from './Dodge.shared.svelte.js';
</script>

<script lang="ts" generics="T = any">
  import { getChartContext } from '$lib/contexts/chart.js';
  import { dodge, type DodgeProps } from './Dodge.shared.svelte.js';

  let {
    data: dataProp,
    axis = 'y',
    anchor,
    padding = 1,
    r,
    rx,
    ry,
    position,
    baseline: baselineProp,
    children,
  }: DodgeProps<T> = $props();

  const ctx = getChartContext<T>();

  ctx.registerComponent({ name: 'Dodge', kind: 'composite-mark' });

  const resolvedAnchor = $derived(anchor ?? (axis === 'y' ? 'bottom' : 'left'));

  const data = $derived((dataProp ?? (ctx.data as T[] | undefined) ?? []) as T[]);

  const positionFn = $derived(
    position ?? ((axis === 'y' ? ctx.xGet : ctx.yGet) as (d: T) => number)
  );

  // Rectangular mode is opt-in by providing both `rx` and `ry`.
  const rectangular = $derived(rx != null && ry != null);

  // Resolve `r` (circular fallback) — also serves as the default per-axis
  // half-extent in circular mode (rx === ry === r).
  const rFn = $derived.by(() => {
    if (typeof r === 'function') return r as (d: T) => number;
    if (r != null) return () => r as number;
    if (ctx.config.r) return (d: T) => Number(ctx.rGet(d)) || 0;
    return () => 5;
  });

  function asFn(v: number | ((d: T) => number) | undefined, fallback: (d: T) => number) {
    if (typeof v === 'function') return v as (d: T) => number;
    if (v != null) return () => v as number;
    return fallback;
  }

  const rxFn = $derived(asFn(rx, rFn));
  const ryFn = $derived(asFn(ry, rFn));

  // Default baseline: the chart-coord position of the anchor edge / centerline.
  const baseline = $derived.by(() => {
    if (baselineProp != null) return baselineProp;
    const dim = axis === 'y' ? ctx.height : ctx.width;
    if (resolvedAnchor === 'middle') return dim / 2;
    if (axis === 'y') return resolvedAnchor === 'top' ? 0 : dim; // bottom
    return resolvedAnchor === 'right' ? dim : 0; // left
  });

  const items = $derived.by(() => {
    const input = data.map((d, index) => ({
      x: Number(positionFn(d)) || 0,
      rx: Number(rxFn(d)) || 0,
      ry: Number(ryFn(d)) || 0,
      data: d,
      index,
    }));
    return dodge(input, {
      axis,
      anchor: resolvedAnchor,
      padding,
      baseline,
      rectangular,
    });
  });
</script>

{@render children?.({ items })}
