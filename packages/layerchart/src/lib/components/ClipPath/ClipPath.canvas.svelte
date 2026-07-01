<script lang="ts" module>
  export type { ClipPathProps, ClipPathPropsWithoutHTML } from './ClipPath.shared.svelte.js';
</script>

<script lang="ts">
  import { createId } from '$lib/utils/createId.js';
  import { ClipPathState, type ClipPathProps } from './ClipPath.shared.svelte.js';

  const uid = $props.id();

  let {
    id = createId('clipPath-', uid),
    useId,
    disabled = false,
    invert = false,
    children,
    ...rest
  }: ClipPathProps = $props();

  const c = new ClipPathState(
    () => ({ id, useId, disabled, invert, children, ...rest }) as ClipPathProps
  );

  const url = $derived(`url(#${id})`);

  // Cache the Path2D so `ctx.clip()` gets a stable reference per `path` change.
  const canvasPath = $derived(c.effectivePath ? new Path2D(c.effectivePath) : undefined);

  c.chartCtx.registerComponent({
    name: 'ClipPath',
    kind: 'group',
    canvasRender: {
      render: (ctx) => {
        if (!disabled && canvasPath) {
          ctx.clip(canvasPath, invert ? 'evenodd' : 'nonzero');
        }
      },
      deps: () => [disabled, canvasPath, invert],
    },
  });
</script>

{#if children}
  {@render children({ id, url, useId })}
{/if}
