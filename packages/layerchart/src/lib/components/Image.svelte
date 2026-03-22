<script lang="ts" module>
  import type { SVGAttributes } from 'svelte/elements';
  import type { Without } from '$lib/utils/types.js';
  import type { DataProp } from '$lib/utils/dataProp.js';
  import { createMotion, parseMotionProp, type MotionProp } from '$lib/utils/motion.svelte.js';

  export type ImagePropsWithoutHTML = {
    /**
     * Image URL. In data mode, resolved per item (data property name or accessor).
     * - `string`: literal URL, or if it matches a data property, the value is extracted.
     * - `function(d)`: accessor called per data item, returns URL string.
     */
    href?: string | ((d: any) => string);

    /**
     * The horizontal position (center of image).
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via xScale
     * - `function(d)`: accessor called per data item, result passed through xScale
     *
     * @default 0
     */
    x?: DataProp;

    /**
     * The initial x position (pixel mode only).
     *
     * @default x
     */
    initialX?: number;

    /**
     * The vertical position (center of image).
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via yScale
     * - `function(d)`: accessor called per data item, result passed through yScale
     *
     * @default 0
     */
    y?: DataProp;

    /**
     * The initial y position (pixel mode only).
     *
     * @default y
     */
    initialY?: number;

    /**
     * The width of the image in pixels.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via scale
     * - `function(d)`: accessor called per data item
     *
     * @default 16
     */
    width?: DataProp;

    /**
     * The initial width (pixel mode only).
     *
     * @default width
     */
    initialWidth?: number;

    /**
     * The height of the image in pixels.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via scale
     * - `function(d)`: accessor called per data item
     *
     * @default 16
     */
    height?: DataProp;

    /**
     * The initial height (pixel mode only).
     *
     * @default height
     */
    initialHeight?: number;

    /**
     * Circular clip radius. When set, overrides width/height to 2*r.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via rScale
     * - `function(d)`: accessor called per data item, result passed through rScale
     */
    r?: DataProp;

    /**
     * Rotation in degrees clockwise.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via scale
     * - `function(d)`: accessor called per data item
     */
    rotate?: DataProp;

    /**
     * SVG preserveAspectRatio attribute.
     *
     * @default "xMidYMid meet"
     */
    preserveAspectRatio?: string;

    /**
     * CORS attribute for the image.
     */
    crossOrigin?: '' | 'anonymous' | 'use-credentials';

    /**
     * Image rendering quality.
     */
    imageRendering?: string;

    /**
     * The opacity of the image. (0 to 1)
     */
    opacity?: number;

    /**
     * Data array to iterate over in data mode.
     * Falls back to chart context data when not provided.
     */
    data?: any[];

    /**
     * Key function for keyed {#each} rendering in data mode.
     *
     * @default (d, i) => i
     */
    key?: (d: any, index: number) => any;

    /**
     * A bindable reference to the `<image>` element (pixel mode only).
     *
     * @bindable
     */
    ref?: SVGImageElement;

    /** Motion configuration (pixel mode only). */
    motion?: MotionProp<'x' | 'y' | 'width' | 'height'>;
  };

  export type ImageProps = ImagePropsWithoutHTML &
    Without<SVGAttributes<SVGImageElement>, ImagePropsWithoutHTML>;
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { cls } from '@layerstack/tailwind';
  import { get } from '@layerstack/utils';

  import { getLayerContext } from '$lib/contexts/layer.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { createDataMotionMap, type MotionOptions } from '$lib/utils/motion.svelte.js';
  import { registerCanvasComponent } from './layers/Canvas.svelte';
  import { hasAnyDataProp, resolveDataProp, resolveGeoDataPair } from '$lib/utils/dataProp.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import { chartDataArray } from '$lib/utils/common.js';
  import { createId } from '$lib/utils/createId.js';

  const uid = $props.id();

  let {
    href,
    x = 0,
    initialX,
    y = 0,
    initialY,
    width,
    initialWidth,
    height,
    initialHeight,
    r,
    rotate,
    preserveAspectRatio = 'xMidYMid meet',
    crossOrigin,
    imageRendering,
    opacity,
    data: dataProp,
    key: keyFn = (_: any, i: number) => i,
    ref: refProp = $bindable(),
    motion,
    class: className,
    ...restProps
  }: ImageProps = $props();

  const clipId = createId('image-clip', uid);

  // Data mode detection: if any positional/size prop is a data-space prop
  const dataMode = $derived(hasAnyDataProp(x, y, width, height, r) || typeof href === 'function');

  // Chart context (safe to call outside Chart -- returns fallback)
  const chartCtx = getChartContext();
  const geo = getGeoContext();

  // Data to iterate over in data mode
  const resolvedData: any[] = $derived(
    dataMode ? (dataProp ?? chartDataArray(chartCtx.data)) : []
  );

  // Resolve a single data item to pixel coordinates and dimensions
  function resolveImage(d: any) {
    const resolvedR = r !== undefined ? resolveDataProp(r, d, null, 0) : undefined;
    const defaultSize = resolvedR !== undefined ? resolvedR * 2 : 16;
    const resolvedWidth = width !== undefined ? resolveDataProp(width, d, null, defaultSize) : defaultSize;
    const resolvedHeight = height !== undefined ? resolveDataProp(height, d, null, defaultSize) : defaultSize;

    let resolvedX: number, resolvedY: number;
    if (geo.projection) {
      [resolvedX, resolvedY] = resolveGeoDataPair(x, y, d, geo.projection);
    } else {
      resolvedX = resolveDataProp(x, d, chartCtx.xScale, 0);
      resolvedY = resolveDataProp(y, d, chartCtx.yScale, 0);
    }

    return {
      x: resolvedX,
      y: resolvedY,
      width: resolvedWidth,
      height: resolvedHeight,
      r: resolvedR,
      rotate: rotate !== undefined ? resolveDataProp(rotate, d, null, 0) : undefined,
    };
  }

  // Resolve href for a data item (similar to resolveColorProp pattern)
  function resolveHref(d: any): string | undefined {
    if (!href) return undefined;
    if (typeof href === 'function') return href(d);
    // String: check if it's a data property
    const dataValue = get(d, href);
    if (dataValue !== undefined) return String(dataValue);
    // Otherwise literal URL
    return href;
  }

  // --- Data mode motion ---
  const dataMotionMap = createDataMotionMap(motion as MotionOptions | undefined);

  $effect(() => {
    if (!dataMode || !dataMotionMap) return;
    const activeKeys = new Set<any>();
    for (let i = 0; i < resolvedData.length; i++) {
      const d = resolvedData[i];
      const key = keyFn(d, i);
      activeKeys.add(key);
      const resolved = resolveImage(d);
      untrack(() => dataMotionMap.update(key, { x: resolved.x, y: resolved.y, width: resolved.width, height: resolved.height }));
    }
    untrack(() => dataMotionMap.cleanup(activeKeys));
  });

  // Single source of truth: resolved values with animated overlay
  const resolvedItems = $derived.by(() => {
    if (!dataMode) return [];
    return resolvedData.map((d, i) => {
      const key = keyFn(d, i);
      const resolved = resolveImage(d);
      const animated = dataMotionMap?.get(key);
      return {
        d,
        key,
        x: animated?.x ?? resolved.x,
        y: animated?.y ?? resolved.y,
        width: animated?.width ?? resolved.width,
        height: animated?.height ?? resolved.height,
        r: resolved.r,
        rotate: resolved.rotate,
      };
    });
  });

  // --- Pixel mode ---
  let ref = $state<SVGImageElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  const defaultSize = $derived(typeof r === 'number' ? r * 2 : 16);
  const resolvedPixelWidth = $derived(typeof width === 'number' ? width : defaultSize);
  const resolvedPixelHeight = $derived(typeof height === 'number' ? height : defaultSize);

  const _initialX = initialX ?? (typeof x === 'number' ? x : 0);
  const _initialY = initialY ?? (typeof y === 'number' ? y : 0);
  const _initialWidth = initialWidth ?? resolvedPixelWidth;
  const _initialHeight = initialHeight ?? resolvedPixelHeight;

  const layerCtx = getLayerContext();

  const motionX = createMotion(
    _initialX,
    () => (typeof x === 'number' ? x : 0),
    parseMotionProp(motion, 'x')
  );
  const motionY = createMotion(
    _initialY,
    () => (typeof y === 'number' ? y : 0),
    parseMotionProp(motion, 'y')
  );
  const motionWidth = createMotion(
    _initialWidth,
    () => resolvedPixelWidth,
    parseMotionProp(motion, 'width')
  );
  const motionHeight = createMotion(
    _initialHeight,
    () => resolvedPixelHeight,
    parseMotionProp(motion, 'height')
  );

  // Pixel mode r and rotate (only when direct number values)
  const pixelR = $derived(typeof r === 'number' ? r : undefined);
  const pixelRotate = $derived(typeof rotate === 'number' ? rotate : undefined);

  // --- Canvas image cache ---
  const imageCache = new Map<string, HTMLImageElement>();
  let loadedImageCount = $state(0);

  function getOrLoadImage(src: string): HTMLImageElement | null {
    const cached = imageCache.get(src);
    if (cached?.complete) return cached;
    if (cached) return null; // Still loading

    const img = new window.Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.src = src;
    img.onload = () => {
      loadedImageCount++;
    };
    imageCache.set(src, img);
    return img.complete ? img : null;
  }

  function canvasRender(ctx: CanvasRenderingContext2D) {
    if (dataMode) {
      for (const item of resolvedItems) {
        const resolvedHrefValue = resolveHref(item.d);
        if (!resolvedHrefValue) continue;

        const img = getOrLoadImage(resolvedHrefValue);
        if (!img) continue;

        const renderX = item.x - item.width / 2;
        const renderY = item.y - item.height / 2;

        ctx.save();

        if (opacity !== undefined) {
          ctx.globalAlpha = opacity;
        }

        if (item.rotate) {
          ctx.translate(item.x, item.y);
          ctx.rotate((item.rotate * Math.PI) / 180);
          ctx.translate(-item.x, -item.y);
        }

        if (item.r !== undefined) {
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.r, 0, 2 * Math.PI);
          ctx.clip();
        }

        ctx.drawImage(img, renderX, renderY, item.width, item.height);
        ctx.restore();
      }
    } else {
      const hrefValue = typeof href === 'string' ? href : undefined;
      if (!hrefValue) return;

      const img = getOrLoadImage(hrefValue);
      if (!img) return;

      const cx = motionX.current;
      const cy = motionY.current;
      const w = motionWidth.current;
      const h = motionHeight.current;
      const renderX = cx - w / 2;
      const renderY = cy - h / 2;

      ctx.save();

      if (opacity !== undefined) {
        ctx.globalAlpha = opacity;
      }

      if (pixelRotate) {
        ctx.translate(cx, cy);
        ctx.rotate((pixelRotate * Math.PI) / 180);
        ctx.translate(-cx, -cy);
      }

      if (pixelR !== undefined) {
        ctx.beginPath();
        ctx.arc(cx, cy, pixelR, 0, 2 * Math.PI);
        ctx.clip();
      }

      ctx.drawImage(img, renderX, renderY, w, h);
      ctx.restore();
    }
  }

  if (layerCtx === 'canvas') {
    registerCanvasComponent({
      name: 'Image',
      render: canvasRender,
      events: {
        click: restProps.onclick,
        pointerdown: restProps.onpointerdown,
        pointerenter: restProps.onpointerenter,
        pointermove: restProps.onpointermove,
        pointerleave: restProps.onpointerleave,
      },
      deps: () => [
        dataMode,
        dataMode ? resolvedItems : null,
        motionX.current,
        motionY.current,
        motionWidth.current,
        motionHeight.current,
        href,
        opacity,
        className,
        restProps.style,
        loadedImageCount,
      ],
    });
  }
</script>

{#if layerCtx === 'svg'}
  {#if dataMode}
    {#each resolvedItems as item, i (item.key)}
      {@const resolvedHrefValue = resolveHref(item.d)}
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
        {...restProps}
      />
    {/each}
  {:else}
    {#if pixelR !== undefined}
      <defs>
        <clipPath id={clipId}>
          <circle cx={motionX.current} cy={motionY.current} r={pixelR} />
        </clipPath>
      </defs>
    {/if}
    <image
      bind:this={ref}
      href={typeof href === 'string' ? href : undefined}
      x={motionX.current - motionWidth.current / 2}
      y={motionY.current - motionHeight.current / 2}
      width={motionWidth.current}
      height={motionHeight.current}
      clip-path={pixelR !== undefined ? `url(#${clipId})` : undefined}
      transform={pixelRotate ? `rotate(${pixelRotate}, ${motionX.current}, ${motionY.current})` : undefined}
      {preserveAspectRatio}
      crossorigin={crossOrigin}
      image-rendering={imageRendering}
      {opacity}
      class={cls('lc-image', className)}
      {...restProps}
    />
  {/if}
{:else if layerCtx === 'html'}
  {#if dataMode}
    {#each resolvedItems as item (item.key)}
      {@const resolvedHrefValue = resolveHref(item.d)}
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
        {...restProps}
      />
    {/each}
  {:else}
    <img
      src={typeof href === 'string' ? href : undefined}
      alt=""
      style:position="absolute"
      style:left="{motionX.current - motionWidth.current / 2}px"
      style:top="{motionY.current - motionHeight.current / 2}px"
      style:width="{motionWidth.current}px"
      style:height="{motionHeight.current}px"
      style:clip-path={pixelR !== undefined ? `circle(${pixelR}px at center)` : undefined}
      style:transform={pixelRotate ? `rotate(${pixelRotate}deg)` : undefined}
      style:opacity
      style:object-fit="cover"
      crossorigin={crossOrigin}
      class={cls('lc-image', className)}
      {...restProps}
    />
  {/if}
{/if}

<style>
  @layer base {
    :global(:where(.lc-image)) {
      pointer-events: none;
    }
  }
</style>
