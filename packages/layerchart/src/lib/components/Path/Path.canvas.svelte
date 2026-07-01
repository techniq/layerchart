<script lang="ts" module>
  export type { PathProps, PathPropsWithoutHTML } from './Path.shared.svelte.js';
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { merge } from '@layerstack/utils';
  import { renderPathData, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import { createKey } from '$lib/utils/key.svelte.js';
  import { PathState, type PathProps } from './Path.shared.svelte.js';

  let { pathData, ...rest }: PathProps = $props();

  const c = new PathState(
    () => pathData,
    () => rest as PathProps
  );

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
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
        (rest as any).style,
      ],
    },
  });
</script>
