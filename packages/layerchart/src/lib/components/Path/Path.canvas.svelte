<script lang="ts" module>
  export type { PathProps, PathPropsWithoutHTML } from './Path.shared.svelte.js';
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { merge } from '@layerstack/utils';
  import {
    renderExtrudedShades,
    renderPathData,
    type ComputedStylesOptions,
  } from '$lib/utils/canvas.js';
  import { createKey } from '$lib/utils/key.svelte.js';
  import { PathExtrusion, PathState, type PathProps } from './Path.shared.svelte.js';

  let { pathData, ...rest }: PathProps = $props();

  const c = new PathState(
    () => pathData,
    () => rest as PathProps
  );
  const extrusion = new PathExtrusion(
    () => c.tweenedPathData ?? '',
    () => rest,
    rest.motion
  );

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    const raised = extrusion.raised;
    if (raised) {
      // Extruded: the sides facing the viewer, then the shape on top
      if (raised.sides) {
        renderPathData(
          ctx,
          raised.sides,
          styleOverrides ?? {
            // The shape's colour, but not its outline (see the svg layer)
            styles: {
              fill: rest.fill,
              fillOpacity: rest.fillOpacity,
              opacity: rest.opacity,
              stroke: 'none',
            },
            classes: cls('lc-path-side', rest.class as string | undefined),
          }
        );
      }
      // Not on the hit canvas, which needs the flat hit colour
      if (!styleOverrides) {
        renderExtrudedShades(
          ctx,
          raised.shades,
          typeof rest.opacity === 'number' ? rest.opacity : 1
        );
      }
      ctx.save();
      ctx.translate(raised.shift.x, raised.shift.y);
    }
    renderPathData(
      ctx,
      c.tweenedPathData ?? '',
      styleOverrides
        ? merge({ styles: { strokeWidth: rest.strokeWidth } }, styleOverrides)
        : {
            styles: {
              fill: rest.fill,
              fillOpacity: rest.fillOpacity,
              stroke: rest.stroke,
              strokeOpacity: rest.strokeOpacity,
              strokeWidth: rest.strokeWidth,
              opacity: rest.opacity,
            },
            classes: cls('lc-path', rest.class as string | undefined),
            style: (rest as any).style as string | undefined,
          }
    );
    if (raised) ctx.restore();
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue
  const fillKey = createKey(() => rest.fill);
  const strokeKey = createKey(() => rest.stroke);

  c.chartCtx.registerComponent({
    name: 'Path',
    kind: 'mark',
    canvasRender: {
      render,
      events: {
        get click() {
          return (rest as any).onclick;
        },
        get pointerenter() {
          return (rest as any).onpointerenter;
        },
        get pointermove() {
          return (rest as any).onpointermove;
        },
        get pointerleave() {
          return (rest as any).onpointerleave;
        },
        get pointerdown() {
          return (rest as any).onpointerdown;
        },
        get pointerover() {
          return (rest as any).onpointerover;
        },
        get pointerout() {
          return (rest as any).onpointerout;
        },
        get touchmove() {
          return (rest as any).ontouchmove;
        },
      },
      deps: () => [
        fillKey.current,
        rest.fillOpacity,
        strokeKey.current,
        rest.strokeOpacity,
        rest.strokeWidth,
        rest.opacity,
        rest.class,
        c.tweenedPathData,
        extrusion.raised,
        (rest as any).style,
      ],
    },
  });
</script>
