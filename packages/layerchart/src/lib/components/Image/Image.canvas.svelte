<script lang="ts" module>
  export type {
    ImageProps,
    ImagePropsWithoutHTML,
  } from './Image.shared.svelte.js';
</script>

<script lang="ts">
  import { ImageState, imageMarkInfo, type ImageProps } from './Image.shared.svelte.js';

  let { ...rest }: ImageProps = $props();

  const c = new ImageState(() => rest as ImageProps);

  // --- Canvas image cache ---
  const imageCache = new Map<string, HTMLImageElement>();
  let loadedImageCount = $state(0);

  function getOrLoadImage(src: string): HTMLImageElement | null {
    const cached = imageCache.get(src);
    if (cached?.complete) return cached;
    if (cached) return null; // Still loading

    const img = new window.Image();
    if (rest.crossOrigin) img.crossOrigin = rest.crossOrigin;
    img.src = src;
    img.onload = () => {
      loadedImageCount++;
    };
    imageCache.set(src, img);
    return img.complete ? img : null;
  }

  function canvasRender(ctx: CanvasRenderingContext2D) {
    if (c.dataMode) {
      for (const item of c.resolvedItems) {
        const resolvedHrefValue = c.resolveHref(item.d);
        if (!resolvedHrefValue) continue;

        const img = getOrLoadImage(resolvedHrefValue);
        if (!img) continue;

        const renderX = item.x - item.width / 2;
        const renderY = item.y - item.height / 2;

        ctx.save();

        if (rest.opacity !== undefined) {
          ctx.globalAlpha = rest.opacity;
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
      const hrefValue = typeof rest.href === 'string' ? rest.href : undefined;
      if (!hrefValue) return;

      const img = getOrLoadImage(hrefValue);
      if (!img) return;

      const cx = c.motionX;
      const cy = c.motionY;
      const w = c.motionWidth;
      const h = c.motionHeight;
      const renderX = cx - w / 2;
      const renderY = cy - h / 2;

      ctx.save();

      if (rest.opacity !== undefined) {
        ctx.globalAlpha = rest.opacity;
      }

      if (c.pixelRotate) {
        ctx.translate(cx, cy);
        ctx.rotate((c.pixelRotate * Math.PI) / 180);
        ctx.translate(-cx, -cy);
      }

      if (c.pixelR !== undefined) {
        ctx.beginPath();
        ctx.arc(cx, cy, c.pixelR, 0, 2 * Math.PI);
        ctx.clip();
      }

      ctx.drawImage(img, renderX, renderY, w, h);
      ctx.restore();
    }
  }

  c.chartCtx.registerComponent({
    name: 'Image',
    kind: 'mark',
    markInfo: () => imageMarkInfo(rest as ImageProps, c.dataMode),
    canvasRender: {
      render: canvasRender,
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
        c.motionX,
        c.motionY,
        c.motionWidth,
        c.motionHeight,
        rest.href,
        rest.opacity,
        rest.class,
        (rest as any).style,
        loadedImageCount,
      ],
    },
  });
</script>
