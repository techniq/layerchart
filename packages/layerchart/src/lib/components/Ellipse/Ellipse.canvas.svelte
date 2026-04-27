<script lang="ts" module>
  export type {
    EllipseProps,
    EllipsePropsWithoutHTML,
  } from './Ellipse.shared.svelte.js';
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { merge } from '@layerstack/utils';
  import { renderEllipse, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
  import { createKey } from '$lib/utils/key.svelte.js';
  import { EllipseState, ellipseMarkInfo, type EllipseProps } from './Ellipse.shared.svelte.js';

  let { ...rest }: EllipseProps = $props();

  const c = new EllipseState(() => rest as EllipseProps);

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
          styles: {
            fill: itemFill ?? c.staticFill,
            fillOpacity: itemFillOpacity ?? c.staticFillOpacity,
            stroke: itemStroke ?? c.staticStroke,
            strokeWidth: itemStrokeWidth ?? c.staticStrokeWidth,
            opacity: itemOpacity ?? c.staticOpacity,
          },
          classes: cls('lc-ellipse', itemClass ?? c.staticClassName),
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
        renderEllipse(ctx, item, styleOpts);
      }
    } else {
      const styleOpts = getStyleOptions(styleOverrides);
      renderEllipse(
        ctx,
        { cx: c.motionCx, cy: c.motionCy, rx: c.motionRx, ry: c.motionRy },
        styleOpts
      );
    }
  }

  const fillKey = createKey(() => rest.fill);
  const strokeKey = createKey(() => rest.stroke);

  c.chartCtx.registerComponent({
    name: 'Ellipse',
    kind: 'mark',
    markInfo: () => ellipseMarkInfo(rest as EllipseProps, c.dataMode),
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
        c.motionRx,
        c.motionRy,
        fillKey.current,
        rest.fillOpacity,
        strokeKey.current,
        rest.strokeWidth,
        rest.opacity,
        rest.class,
      ],
    },
  });
</script>
