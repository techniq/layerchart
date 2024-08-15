<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';
  import type { Readable } from 'svelte/store';
  import {
    geoTransform as d3geoTransform,
    type GeoIdentityTransform,
    type GeoPermissibleObjects,
    type GeoProjection,
    type GeoTransformPrototype,
  } from 'd3-geo';
  import { cls } from '@layerstack/tailwind';

  import { chartContext } from './ChartContext.svelte';
  import { geoContext } from './GeoContext.svelte';
  import type { TooltipContextValue } from './tooltip/TooltipContext.svelte';
  import { curveLinearClosed, type CurveFactory, type CurveFactoryLineOnly } from 'd3-shape';
  import { geoCurvePath } from '$lib/utils/geo.js';

  export let geojson: GeoPermissibleObjects | null | undefined = undefined;

  /** Render to canvas */
  export let render:
    | ((
        ctx: CanvasRenderingContext2D,
        options: { geoPath: ReturnType<typeof geoCurvePath> }
      ) => any)
    | undefined = undefined;

  export let fill: string | undefined = undefined;
  export let stroke: string | undefined = undefined;
  export let strokeWidth: number | string | undefined = undefined;

  /**
   * Tooltip context to setup mouse events to show tooltip for related data
   */
  export let tooltip: TooltipContextValue | undefined = undefined;

  /**
   * Curve of path drawn. Imported via d3-shape.
   *
   * @example
   * import { curveCatmullRom } from 'd3-shape';
   * <GeoPath curve={curveCatmullRom} />
   *
   * @type {CurveFactory | CurveFactoryLineOnly | undefined}
   */
  export let curve: CurveFactory | CurveFactoryLineOnly = curveLinearClosed;

  let className: string | undefined = undefined;
  export { className as class };

  const dispatch = createEventDispatcher<{
    click: { geoPath: ReturnType<typeof geoCurvePath>; event: MouseEvent };
  }>();

  const { containerWidth, containerHeight, padding } = chartContext();
  const canvas = getContext<{ ctx: Readable<CanvasRenderingContext2D> }>('canvas');
  const geo = geoContext();

  /**
   * Apply geo transform to projection.  Useful to draw straight lines with `geoMercator` projection.
   * See: https://d3js.org/d3-geo/projection#geoTransform and https://stackoverflow.com/a/56409480/191902
   **/
  export let geoTransform:
    | ((projection: GeoProjection | GeoIdentityTransform) => GeoTransformPrototype)
    | undefined = undefined;

  $: _projection = geoTransform ? d3geoTransform(geoTransform($geo)) : $geo;

  $: geoPath = geoCurvePath(_projection, curve);

  const DEFAULT_FILL = 'rgb(0, 0, 0)';

  $: renderContext = canvas ? 'canvas' : 'svg';

  $: ctx = canvas?.ctx;
  $: if (renderContext === 'canvas' && $ctx) {
    let computedStyles: Partial<CSSStyleDeclaration> = {};

    // Transfer classes defined on <GeoPath> to <canvas> to enable window.getComputedStyle() retrieval (Tailwind classes, etc)
    if (className) {
      $ctx.canvas.classList.add(...className.split(' '));
      computedStyles = window.getComputedStyle($ctx.canvas);
    }

    // console.count('render');

    // Clear with negative offset due to Canvas `context.translate(...)`
    $ctx.clearRect(-$padding.left, -$padding.top, $containerWidth, $containerHeight);

    if (render) {
      geoPath = geoCurvePath(_projection, curve, $ctx);
      render($ctx, { geoPath });
    } else {
      $ctx.beginPath();
      // Set the context here since setting it in `$: geoPath` is a circular reference
      geoPath = geoCurvePath(_projection, curve, $ctx);
      if (geojson) {
        geoPath(geojson);
      }

      $ctx.fillStyle =
        fill ??
        (computedStyles.fill !== DEFAULT_FILL ? computedStyles.fill : undefined) ??
        'transparent';
      $ctx.fill();

      $ctx.lineWidth = Number(strokeWidth ?? 0);
      $ctx.strokeStyle =
        stroke ?? computedStyles.stroke === 'none' ? 'transparent' : computedStyles.stroke ?? '';
      $ctx.stroke();
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if renderContext === 'svg'}
  <slot {geoPath}>
    <path
      {...$$restProps}
      d={geojson ? geoPath(geojson) : ''}
      {fill}
      {stroke}
      stroke-width={strokeWidth}
      on:pointerenter={(e) => tooltip?.show(e, geojson)}
      on:pointerenter
      on:pointermove={(e) => tooltip?.show(e, geojson)}
      on:pointermove
      on:pointerleave={(e) => tooltip?.hide()}
      on:pointerleave
      on:pointerdown
      on:click={(event) => dispatch('click', { geoPath, event })}
      class={cls(fill == null && 'fill-transparent', className)}
    />
  </slot>
{/if}
