<script lang="ts" module>
  export type {
    PolygonProps,
    PolygonPropsWithoutHTML,
  } from './Polygon.shared.svelte.js';
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { merge } from '@layerstack/utils';
  import { renderPathData, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
  import { createKey } from '$lib/utils/key.svelte.js';
  import { PolygonState, polygonMarkInfo, type PolygonProps } from './Polygon.shared.svelte.js';

  let { ...rest }: PolygonProps = $props();

  const c = new PolygonState(() => rest as PolygonProps);

  function getStyleOptions(
    styleOverrides: ComputedStylesOptions | undefined,
    itemFill?: string | undefined,
    itemStroke?: string | undefined,
    itemFillOpacity?: number | undefined,
    itemStrokeWidth?: number | undefined,
    itemOpacity?: number | undefined,
    itemClass?: string | undefined
  ) {
    return styleOverrides
      ? merge(
          { styles: { strokeWidth: itemStrokeWidth ?? c.staticStrokeWidth } },
          styleOverrides
        )
      : {
          // Use raw `rest.fill` / `rest.stroke` (not `staticFill`) so canvas
          // accepts non-string values like `CanvasPattern` / `CanvasGradient`.
          styles: {
            fill: itemFill ?? (rest.fill as any),
            fillOpacity: itemFillOpacity ?? c.staticFillOpacity,
            stroke: itemStroke ?? (rest.stroke as any),
            strokeWidth: itemStrokeWidth ?? c.staticStrokeWidth,
            opacity: itemOpacity ?? c.staticOpacity,
          },
          classes: cls('lc-polygon', itemClass ?? c.staticClassName),
          style: (rest as any).style as string | undefined,
        };
  }

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    if (c.dataMode) {
      for (const d of c.resolvedData) {
        const pathData = c.resolvePolygonPath(d);
        const resolvedFill = resolveColorProp(rest.fill, d, c.chartCtx.cScale);
        const resolvedStroke = resolveColorProp(rest.stroke, d, c.chartCtx.cScale);
        const resolvedFillOpacity = resolveStyleProp(rest.fillOpacity, d);
        const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, d);
        const resolvedOpacity = resolveStyleProp(rest.opacity, d);
        const resolvedClass = resolveStyleProp(rest.class, d);
        const styleOpts = getStyleOptions(
          styleOverrides,
          resolvedFill,
          resolvedStroke,
          resolvedFillOpacity,
          resolvedStrokeWidth,
          resolvedOpacity,
          resolvedClass
        );
        renderPathData(ctx, pathData, styleOpts);
      }
    } else {
      const styleOpts = getStyleOptions(styleOverrides);
      renderPathData(ctx, c.tweenedPathData, styleOpts);
    }
  }

  const fillKey = createKey(() => rest.fill);
  const strokeKey = createKey(() => rest.stroke);

  c.chartCtx.registerComponent({
    name: 'Polygon',
    kind: 'mark',
    markInfo: () => polygonMarkInfo(rest as PolygonProps, c.dataMode),
    canvasRender: {
      render,
      events: {
        click: (rest as any).onclick,
        pointerenter: (rest as any).onpointerenter,
        pointermove: (rest as any).onpointermove,
        pointerleave: (rest as any).onpointerleave,
        pointerdown: (rest as any).onpointerdown,
        pointerover: (rest as any).onpointerover,
        pointerout: (rest as any).onpointerout,
        touchmove: (rest as any).ontouchmove,
      },
      deps: () => [
        c.dataMode,
        c.dataMode ? c.resolvedItems : null,
        fillKey.current,
        rest.fillOpacity,
        strokeKey.current,
        rest.strokeWidth,
        rest.opacity,
        rest.class,
        c.tweenedPathData,
        (rest as any).style,
      ],
    },
  });
</script>
