<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';
  import { type GeoPath, type GeoPermissibleObjects } from 'd3-geo';
  import { scaleCanvas } from 'layercake';
  import { cls } from 'svelte-ux';

  import { geoContext } from './GeoContext.svelte';
  import type { TooltipContextValue } from './TooltipContext.svelte';
  import { curveLinearClosed, type CurveFactory, type CurveFactoryLineOnly } from 'd3-shape';
  import { geoCurvePath } from '$lib/utils/geo.js';

  export let geojson: GeoPermissibleObjects;

  export let fill: string | undefined = undefined;
  export let stroke: string | undefined = undefined;
  export let strokeWidth: number | string | undefined = undefined;

  /** Render to canvas */
  export let render: ((ctx: CanvasRenderingContext2D, { geoPath: GeoPath }) => any) | undefined =
    undefined;

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

  const dispatch = createEventDispatcher<{ click: { geoPath: GeoPath; event: MouseEvent } }>();

  const { width, height } = getContext('LayerCake');
  const canvas = getContext('canvas');
  const geo = geoContext();

  $: geoPath = geoCurvePath($geo, curve);

  const DEFAULT_FILL = 'rgb(0, 0, 0)';

  $: renderContext = canvas ? 'canvas' : 'svg';

  $: ctx = canvas?.ctx;
  $: if (renderContext === 'canvas' && $ctx) {
    let computedStyles: Partial<CSSStyleDeclaration> = {};

    // Transfer classes defined on <GeoPath> to <canvas> to enable window.getComputedStyle() retrieval (Tailwind classes, etc)
    if ($$props.class) {
      $ctx.canvas.classList.add(...$$props.class.split(' '));
      computedStyles = window.getComputedStyle($ctx.canvas);
    }

    // console.count('render');
    scaleCanvas($ctx, $width, $height);
    $ctx.clearRect(0, 0, $width, $height);

    if (render) {
      geoPath = geoCurvePath($geo, curve, $ctx);
      render($ctx, { geoPath });
    } else {
      $ctx.beginPath();
      // Set the context here since setting it in `$: geoPath` is a circular reference
      geoPath = geoCurvePath($geo, curve, $ctx);
      geoPath(geojson);

      $ctx.fillStyle =
        fill ??
        (computedStyles.fill !== DEFAULT_FILL ? computedStyles.fill : undefined) ??
        'transparent';
      $ctx.fill();

      $ctx.lineWidth = strokeWidth;
      $ctx.strokeStyle = stroke ?? computedStyles.stroke;
      $ctx.stroke();
    }
  }
</script>

{#if renderContext === 'svg'}
  <slot {geoPath}>
    <path
      {...$$restProps}
      d={geoPath(geojson)}
      {fill}
      {stroke}
      on:pointermove={(e) => tooltip?.show(e, geojson)}
      on:pointermove
      on:pointerleave={(e) => tooltip?.hide()}
      on:pointerleave
      on:click={(event) => dispatch('click', { geoPath, event })}
      on:click
      class={cls($$props.fill == null && 'fill-transparent', $$props.class)}
    />
  </slot>
{/if}
