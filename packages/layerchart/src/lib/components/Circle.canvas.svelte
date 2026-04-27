<script lang="ts" module>
  export type {
    CircleProps,
    CirclePropsWithoutHTML,
  } from './Circle.shared.svelte.js';
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { merge } from '@layerstack/utils';
  import { renderCircle, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
  import { createKey } from '$lib/utils/key.svelte.js';
  import {
    CircleState,
    circleMarkInfo,
    type CircleProps,
  } from './Circle.shared.svelte.js';

  let { ...rest }: CircleProps = $props();

  const c = new CircleState(() => rest as CircleProps);

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
          styles: {
            fill: itemFill ?? c.staticFill,
            fillOpacity: itemFillOpacity ?? c.staticFillOpacity,
            stroke: itemStroke ?? c.staticStroke,
            strokeWidth: itemStrokeWidth ?? c.staticStrokeWidth,
            opacity: itemOpacity ?? c.staticOpacity,
          },
          classes: cls('lc-circle', itemClass ?? c.staticClassName),
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
        renderCircle(ctx, item, styleOpts);
      }
    } else {
      const styleOpts = getStyleOptions(styleOverrides);
      renderCircle(
        ctx,
        { cx: c.motionCx, cy: c.motionCy, r: c.motionR },
        styleOpts
      );
    }
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  const fillKey = createKey(() => rest.fill);
  const strokeKey = createKey(() => rest.stroke);

  c.chartCtx.registerComponent({
    name: 'Circle',
    kind: 'mark',
    markInfo: () => circleMarkInfo(rest as CircleProps, c.dataMode),
    canvasRender: {
      render,
      events: {
        click: (rest as any).onclick,
        pointerdown: (rest as any).onpointerdown,
        pointerenter: (rest as any).onpointerenter,
        pointermove: (rest as any).onpointermove,
        pointerleave: (rest as any).onpointerleave,
      },
      deps: () => [
        c.dataMode,
        c.dataMode ? c.resolvedItems : null,
        c.motionCx,
        c.motionCy,
        c.motionR,
        fillKey.current,
        rest.fillOpacity,
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
