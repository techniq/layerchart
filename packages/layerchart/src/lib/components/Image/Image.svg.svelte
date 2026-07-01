<script lang="ts" module>
  export type {
    ImageProps,
    ImagePropsWithoutHTML,
  } from './Image.shared.svelte.js';
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { createId } from '$lib/utils/createId.js';
  import { ImageState, imageMarkInfo, type ImageProps } from './Image.shared.svelte.js';

  const uid = $props.id();

  let {
    href,
    ref: refProp = $bindable(),
    preserveAspectRatio = 'xMidYMid meet',
    crossOrigin,
    imageRendering,
    class: className,
    // Pull out props that collide with `<image>` SVG attribute names so spread
    // doesn't clobber our explicit attrs.
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
    opacity,
    ...rest
  }: ImageProps = $props();

  const c = new ImageState(
    () =>
      ({
        href,
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
        opacity,
        ...rest,
      }) as ImageProps
  );

  const clipId = createId('image-clip', uid);

  let ref = $state<SVGImageElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  c.chartCtx.registerComponent({
    name: 'Image',
    kind: 'mark',
    markInfo: () => imageMarkInfo({ x, y, data, ...rest } as ImageProps, c.dataMode),
  });
</script>

{#if c.dataMode}
  {#each c.resolvedItems as item, i (item.key)}
    {@const resolvedHrefValue = c.resolveHref(item.d)}
    {@const renderX = item.x - item.width / 2}
    {@const renderY = item.y - item.height / 2}
    {#if item.r !== undefined}
      <defs>
        <clipPath id="{clipId}-{i}">
          <circle cx={item.x} cy={item.y} r={item.r} />
        </clipPath>
      </defs>
    {/if}
    <image
      {...rest as any}
      href={resolvedHrefValue}
      x={renderX}
      y={renderY}
      width={item.width}
      height={item.height}
      clip-path={item.r !== undefined ? `url(#${clipId}-${i})` : undefined}
      transform={item.rotate ? `rotate(${item.rotate}, ${item.x}, ${item.y})` : undefined}
      {preserveAspectRatio}
      crossorigin={crossOrigin}
      image-rendering={imageRendering}
      {opacity}
      class={cls('lc-image', className)}
    />
  {/each}
{:else}
  {#if c.pixelR !== undefined}
    <defs>
      <clipPath id={clipId}>
        <circle cx={c.motionX} cy={c.motionY} r={c.pixelR} />
      </clipPath>
    </defs>
  {/if}
  <image
    {...rest as any}
    bind:this={ref}
    href={typeof href === 'string' ? href : undefined}
    x={c.motionX - c.motionWidth / 2}
    y={c.motionY - c.motionHeight / 2}
    width={c.motionWidth}
    height={c.motionHeight}
    clip-path={c.pixelR !== undefined ? `url(#${clipId})` : undefined}
    transform={c.pixelRotate ? `rotate(${c.pixelRotate}, ${c.motionX}, ${c.motionY})` : undefined}
    {preserveAspectRatio}
    crossorigin={crossOrigin}
    image-rendering={imageRendering}
    {opacity}
    class={cls('lc-image', className)}
  />
{/if}