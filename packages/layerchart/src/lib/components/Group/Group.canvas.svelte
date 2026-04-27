<script lang="ts" module>
  export type {
    GroupProps,
    GroupPropsWithoutHTML,
  } from './Group.shared.svelte.js';
</script>

<script lang="ts">
  import { GroupState, type GroupProps } from './Group.shared.svelte.js';

  let { children, ...rest }: GroupProps = $props();

  const c = new GroupState(() => ({ children, ...rest }) as GroupProps);

  c.chartCtx.registerComponent({
    name: 'Group',
    kind: 'group',
    canvasRender: {
      render: (ctx) => {
        ctx.translate(c.motionX ?? 0, c.motionY ?? 0);
        if (rest.opacity != null) {
          ctx.globalAlpha *= rest.opacity;
        }
      },
      events: {
        click: (rest as any).onclick,
        dblclick: (rest as any).ondblclick,
        pointerenter: (rest as any).onpointerenter,
        pointermove: (rest as any).onpointermove,
        pointerleave: (rest as any).onpointerleave,
        pointerdown: (rest as any).onpointerdown,
      },
      deps: () => [c.motionX, c.motionY, rest.opacity],
    },
  });
</script>

{@render children?.()}
