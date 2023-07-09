<script lang="ts">
  import { getContext } from 'svelte';
  import type { tweened as tweenedStore } from 'svelte/motion';
  import { draw as _drawTransition } from 'svelte/transition';

  import { line as d3Line } from 'd3-shape';
  import type { CurveFactory, CurveFactoryLineOnly, Line } from 'd3-shape';
  // import { interpolateString } from 'd3-interpolate';
  import { interpolatePath } from 'd3-interpolate-path';

  import { motionStore } from '$lib/stores/motionStore';
  import { cls } from 'svelte-ux';

  const { data: contextData, xGet, yGet } = getContext('LayerCake');

  /** Override data instead of using context */
  export let data: any = undefined;

  /** Pass `<path d={...} />` explicitly instead of calculating from data / context */
  export let pathData: string | undefined | null = undefined;

  /** Override x accessor */
  export let x: any = undefined; // TODO: Update Type
  /** Override y accessor */
  export let y: any = undefined; // TODO: Update Type

  /** Interpolate path data using d3-interpolate-path.  Works best without `draw` enabled */
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;
  /** Draw path over time.  Works best without `tweened` enabled */
  export let draw: boolean | Parameters<typeof _drawTransition>[1] = undefined;

  export let curve: CurveFactory | CurveFactoryLineOnly | undefined = undefined;
  export let defined: Parameters<Line<any>['defined']>[0] | undefined = undefined;

  $: tweenedOptions = tweened ? { interpolate: interpolatePath, ...tweened } : false;
  $: tweened_d = motionStore('', { tweened: tweenedOptions });
  $: {
    const path = d3Line()
      .x(x ?? $xGet)
      .y(y ?? $yGet);
    if (curve) path.curve(curve);
    if (defined) path.defined(defined);

    const d = pathData ?? path(data ?? $contextData);
    tweened_d.set(d);
  }

  $: drawTransition = draw ? _drawTransition : () => ({});

  let key = Symbol();
  $: if (draw) {
    // Anytime the path data changes, redraw
    $tweened_d;
    key = Symbol();
  }
</script>

{#key key}
  <path
    d={$tweened_d}
    {...$$restProps}
    class={cls('path-line fill-none', !$$props.stroke && 'stroke-black', $$props.class)}
    in:drawTransition={typeof draw === 'object' ? draw : undefined}
    on:click
    on:mousemove
    on:mouseleave
  />
{/key}
