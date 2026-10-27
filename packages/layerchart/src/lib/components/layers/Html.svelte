<script lang="ts" module>
  // aliased — `Facet` is the component rendering the panels
  import type { Facet as Panel } from '$lib/states/facet.svelte.js';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Without } from '$lib/utils/types.js';
  import type { Snippet } from 'svelte';

  type HTMLPropsWithoutHTML = {
    /**
     * A reference to the layer's outermost `<div>` tag.
     *
     * @bindable
     */
    ref?: HTMLElement;

    /**
     * The layer's z-index.
     */
    zIndex?: number;

    /**
     * Set this to `false` to set `pointer-events: none;` on the entire layer.
     */
    pointerEvents?: boolean;

    /**
     * A string passed to the `aria-role` on the `<div>` tag.
     * This is `undefined` by default but will be set by default to `'figure'`
     * if `label`, `labelledby` or `describedby` is set. That default will be overridden by whatever is passed in.
     */
    role?: string;

    /**
     * Translate children to center (useful for radial layouts)
     */
    center?: boolean | 'x' | 'y';

    /**
     * Ignore TransformContext and the chart's `isometric` view.  Useful to add static elements
     * such as legends.
     */
    ignoreTransform?: boolean;

    /**
     * Whether to clip overflow content.
     * When true, clips at the chart's edge (the container, padding included), as the SVG layer does.
     *
     * Defaults to clipping when the chart has a `transform`, as panning and zooming carry what's
     * drawn past its edges.
     *
     * @default true with a chart `transform`, else false
     */
    clip?: boolean;

    children?: Snippet<[{ ref: HTMLElement; facet: Panel }]>;
  };

  export type HTMLProps = HTMLPropsWithoutHTML &
    Without<HTMLAttributes<HTMLElement>, HTMLPropsWithoutHTML>;
</script>

<script lang="ts">
  import Facet from '../Facet.svelte';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { setLayerContext } from '$lib/contexts/layer.js';
  import { setLayerIsometric } from '$lib/contexts/isometric.js';
  import { applyMatrix, invertMatrix, matrixToString } from '$lib/utils/isometric.js';

  let {
    ref: refProp = $bindable(),
    zIndex = 0,
    pointerEvents = true,
    role,
    'aria-label': label,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
    center = false,
    ignoreTransform = false,
    clip,
    class: className,
    children: childrenProp,
    ...restProps
  }: HTMLProps = $props();

  let ref = $state<HTMLElement>();
  $effect.pre(() => {
    refProp = ref;
  });

  const roleVal = $derived(role || (label || labelledBy || describedBy ? 'figure' : undefined));

  const ctx = getChartContext();

  // Shared with the tooltip's pointer lookups, so what's drawn and what's hit agree
  const matrix = $derived(ctx.layerMatrix({ ignoreTransform, center }));
  const transform = $derived(matrix ? matrixToString(matrix) : undefined);

  setLayerContext('html');
  setLayerIsometric(() => (ignoreTransform ? null : ctx.isometricMatrix));

  const clipped = $derived(clip ?? (ctx.props.transform?.mode ?? 'none') !== 'none');

  // The chart's edge, mapped back into the layer's own space.  `overflow: hidden` would clip the
  // layer's box, which starts inside the padding and moves and scales with the transform
  const clipPath = $derived.by(() => {
    if (!clipped) return undefined;
    const inverse = matrix ? invertMatrix(matrix) : { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
    if (!inverse) return undefined; // collapsed to a line, so there's nothing to see
    const left = -ctx.padding.left;
    const top = -ctx.padding.top;
    const right = left + ctx.containerWidth;
    const bottom = top + ctx.containerHeight;
    const corners = [
      { x: left, y: top },
      { x: right, y: top },
      { x: right, y: bottom },
      { x: left, y: bottom },
    ].map((corner) => applyMatrix(inverse, corner));
    return `polygon(${corners.map(({ x, y }) => `${x}px ${y}px`).join(', ')})`;
  });
</script>

<div
  bind:this={ref}
  class={['lc-layout-html', className]}
  class:disablePointerEvents={pointerEvents === false}
  style:transform
  style:transform-origin="top left"
  style:clip-path={clipPath}
  style:z-index={zIndex}
  style:top="{ctx.padding.top}px"
  style:bottom="{ctx.padding.bottom}px"
  style:left="{ctx.padding.left}px"
  style:right="{ctx.padding.right}px"
  role={roleVal}
  aria-label={label}
  aria-labelledby={labelledBy}
  aria-describedby={describedBy}
  {...restProps}
>
  <Facet>
    {#snippet children({ facet })}
      {@render childrenProp?.({ ref: ref!, facet })}
    {/snippet}
  </Facet>
</div>

<style>
  @layer base {
    :where(.lc-layout-html) {
      position: absolute;
      inset: 0;

      &.disablePointerEvents {
        pointer-events: none;
      }
    }
  }
</style>
