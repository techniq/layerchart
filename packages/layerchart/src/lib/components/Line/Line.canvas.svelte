<script lang="ts" module>
  export type {
    LineProps,
    LinePropsWithoutHTML,
  } from './Line.shared.svelte.js';
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { merge } from '@layerstack/utils';
  import { renderPathData, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
  import { createKey } from '$lib/utils/key.svelte.js';
  import { LineState, lineMarkInfo, type LineProps } from './Line.shared.svelte.js';

  let { ...rest }: LineProps = $props();

  const c = new LineState(() => rest as LineProps);

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
          {
            styles: { strokeWidth: itemStrokeWidth ?? c.staticStrokeWidth },
          },
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
          classes: cls('lc-line', itemClass ?? c.staticClassName),
          style:
            [
              (rest as any).style as string | undefined,
              c.dashArrayAttr ? `stroke-dasharray: ${c.dashArrayAttr}` : undefined,
            ]
              .filter(Boolean)
              .join('; ') || undefined,
        };
  }

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    if (c.dataMode) {
      for (const item of c.resolvedItems) {
        const resolvedFill = resolveColorProp(rest.fill, item.d, c.chartCtx.cScale);
        const resolvedStroke = resolveColorProp(rest.stroke, item.d, c.chartCtx.cScale);
        const resolvedFillOpacity = resolveStyleProp(rest.fillOpacity, item.d);
        const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, item.d);
        const resolvedOpacity = resolveStyleProp(rest.opacity, item.d);
        const resolvedClass = resolveStyleProp(rest.class, item.d);
        const styleOpts = getStyleOptions(
          styleOverrides,
          resolvedFill,
          resolvedStroke,
          resolvedFillOpacity,
          resolvedStrokeWidth,
          resolvedOpacity,
          resolvedClass
        );
        const pathData = `M ${item.x1},${item.y1} L ${item.x2},${item.y2}`;
        renderPathData(ctx, pathData, styleOpts);
      }
    } else {
      const styleOpts = getStyleOptions(styleOverrides);
      const pathData = `M ${c.motionX1},${c.motionY1} L ${c.motionX2},${c.motionY2}`;
      renderPathData(ctx, pathData, styleOpts);
    }
  }

  const fillKey = createKey(() => rest.fill);
  const strokeKey = createKey(() => rest.stroke);

  c.chartCtx.registerComponent({
    name: 'Line',
    kind: 'mark',
    markInfo: () => lineMarkInfo(rest as LineProps, c.dataMode),
    canvasRender: {
      render,
      events: {
        click: (rest as any).onclick,
        pointerenter: (rest as any).onpointerenter,
        pointermove: (rest as any).onpointermove,
        pointerleave: (rest as any).onpointerleave,
      },
      deps: () => [
        c.dataMode,
        c.dataMode ? c.resolvedItems : null,
        c.motionX1,
        c.motionY1,
        c.motionX2,
        c.motionY2,
        fillKey.current,
        strokeKey.current,
        rest.strokeWidth,
        rest.opacity,
        rest.class,
        (rest as any).style,
        c.dashArrayAttr,
      ],
    },
  });
</script>
