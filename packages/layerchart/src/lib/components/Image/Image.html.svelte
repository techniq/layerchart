<script lang="ts" module>
  export type {
    ImageProps,
    ImagePropsWithoutHTML,
  } from './Image.shared.svelte.js';
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { ImageState, imageMarkInfo, type ImageProps } from './Image.shared.svelte.js';

  let {
    href,
    crossOrigin,
    class: className,
    opacity,
    // Pull internal-only props out
    x,
    y,
    width,
    height,
    r,
    rotate,
    initialX,
    initialY,
    initialWidth,
    initialHeight,
    data,
    key,
    motion,
    preserveAspectRatio,
    imageRendering,
    ...rest
  }: ImageProps = $props();

  const c = new ImageState(
    () =>
      ({
        href,
        crossOrigin,
        class: className,
        opacity,
        x,
        y,
        width,
        height,
        r,
        rotate,
        initialX,
        initialY,
        initialWidth,
        initialHeight,
        data,
        key,
        motion,
        preserveAspectRatio,
        imageRendering,
        ...rest,
      }) as ImageProps
  );

  c.chartCtx.registerComponent({
    name: 'Image',
    kind: 'mark',
    markInfo: () => imageMarkInfo({ x, y, data, ...rest } as ImageProps, c.dataMode),
  });
</script>

{#if c.dataMode}
  {#each c.resolvedItems as item (item.key)}
    {@const resolvedHrefValue = c.resolveHref(item.d)}
    <img
      src={resolvedHrefValue}
      alt=""
      style:position="absolute"
      style:left="{item.x - item.width / 2}px"
      style:top="{item.y - item.height / 2}px"
      style:width="{item.width}px"
      style:height="{item.height}px"
      style:clip-path={item.r !== undefined ? `circle(${item.r}px at center)` : undefined}
      style:transform={item.rotate ? `rotate(${item.rotate}deg)` : undefined}
      style:opacity
      style:object-fit="cover"
      crossorigin={crossOrigin}
      class={cls('lc-image', className)}
      {...rest as any}
    />
  {/each}
{:else}
  <img
    src={typeof href === 'string' ? href : undefined}
    alt=""
    style:position="absolute"
    style:left="{c.motionX - c.motionWidth / 2}px"
    style:top="{c.motionY - c.motionHeight / 2}px"
    style:width="{c.motionWidth}px"
    style:height="{c.motionHeight}px"
    style:clip-path={c.pixelR !== undefined ? `circle(${c.pixelR}px at center)` : undefined}
    style:transform={c.pixelRotate ? `rotate(${c.pixelRotate}deg)` : undefined}
    style:opacity
    style:object-fit="cover"
    crossorigin={crossOrigin}
    class={cls('lc-image', className)}
    {...rest as any}
  />
{/if}

<style>
  @layer base {
    :global(:where(.lc-image)) {
      pointer-events: none;
    }
  }
</style>
