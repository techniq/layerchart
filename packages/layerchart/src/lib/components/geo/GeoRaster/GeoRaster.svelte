<script lang="ts" module>
  import type { GeoProjection } from 'd3-geo';

  export type GeoRasterPropsWithoutHTML = {
    /**
     * The image to reproject. Either:
     *
     * - a URL string (loaded via `Image` with `crossOrigin="anonymous"`),
     * - a preloaded `HTMLImageElement`,
     * - an `HTMLCanvasElement` (e.g. a stitched tile mosaic),
     * - or an `ImageBitmap`.
     *
     * The image pixel data must be readable (not tainted by CORS). When passing a
     * URL, the component sets `crossOrigin` on the underlying `Image` — the host
     * must respond with the appropriate `Access-Control-Allow-Origin` header.
     */
    image: string | HTMLImageElement | HTMLCanvasElement | ImageBitmap;

    /**
     * Projection used by the source image. Pass as an uncalled function, e.g.
     * `sourceProjection={geoEquirectangular}`.
     *
     * When omitted, the source is assumed to be an equirectangular (plate carrée)
     * image covering the full globe — i.e. `x = ((lon + 180) / 360) * width`,
     * `y = ((90 - lat) / 180) * height`. This is the common layout for imagery
     * such as NASA Blue Marble / Black Marble.
     */
    sourceProjection?: () => GeoProjection;

    /**
     * Pixel sampling strategy.
     *
     * - `nearest` (default): fastest, slightly blocky at low source resolution.
     * - `bilinear`: smoother, ~4x slower per pixel.
     *
     * @default 'nearest'
     */
    interpolate?: 'nearest' | 'bilinear';

    /**
     * `crossOrigin` attribute applied to the underlying `Image` element when
     * loading from a URL. Set to `null` to disable.
     *
     * @default 'anonymous'
     */
    crossOrigin?: string | null;

    /**
     * Resolution multiplier for the reprojected output, relative to chart CSS
     * pixels. A value greater than 1 produces a sharper image on HiDPI
     * displays at the cost of more work per frame.
     *
     * @default 1
     */
    resolution?: number;

    /**
     * Disable image smoothing when compositing the reprojected buffer onto the
     * destination canvas. Useful for a pixel-art look.
     *
     * @default false
     */
    pixelated?: boolean;
  };

  export type GeoRasterProps = GeoRasterPropsWithoutHTML;
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { geoPath } from 'd3-geo';

  import { getChartContext } from '$lib/contexts/chart.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import { getLayerContext } from '$lib/contexts/layer.js';

  let {
    image,
    sourceProjection,
    interpolate = 'nearest',
    crossOrigin = 'anonymous',
    resolution = 1,
    pixelated = false,
  }: GeoRasterProps = $props();

  const ctx = getChartContext();
  const geo = getGeoContext();
  const layerCtx = getLayerContext();

  type SourcePixels = {
    data: Uint8ClampedArray;
    width: number;
    height: number;
  };

  let source = $state<SourcePixels | null>(null);

  $effect(() => {
    if (typeof window === 'undefined') return;
    // Re-run when `image` changes
    const src = image;

    let cancelled = false;

    async function load() {
      let drawable: CanvasImageSource;
      let sw: number;
      let sh: number;

      if (typeof src === 'string') {
        const img = new Image();
        if (crossOrigin !== null) img.crossOrigin = crossOrigin;
        img.src = src;
        try {
          await img.decode();
        } catch (err) {
          console.warn('[GeoRaster] Failed to decode image', err);
          return;
        }
        drawable = img;
        sw = img.naturalWidth;
        sh = img.naturalHeight;
      } else if (src instanceof HTMLImageElement) {
        try {
          await src.decode();
        } catch (err) {
          console.warn('[GeoRaster] Failed to decode image', err);
          return;
        }
        drawable = src;
        sw = src.naturalWidth;
        sh = src.naturalHeight;
      } else {
        // HTMLCanvasElement or ImageBitmap — already decoded
        drawable = src;
        sw = src.width;
        sh = src.height;
      }

      if (cancelled) return;
      if (!sw || !sh) return;

      const offscreen = document.createElement('canvas');
      offscreen.width = sw;
      offscreen.height = sh;
      const octx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!octx) return;
      octx.drawImage(drawable, 0, 0);

      try {
        const imageData = octx.getImageData(0, 0, sw, sh);
        untrack(() => {
          source = { data: imageData.data, width: sw, height: sh };
        });
      } catch (err) {
        console.warn(
          '[GeoRaster] Unable to read image pixels — the image is likely tainted by CORS',
          err
        );
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  });

  function render(dstCtx: CanvasRenderingContext2D) {
    const src = source;
    if (!src) return;

    const projection = geo.projection;
    if (!projection?.invert) return;

    const width = Math.max(1, Math.floor(ctx.width * resolution));
    const height = Math.max(1, Math.floor(ctx.height * resolution));
    if (width <= 0 || height <= 0) return;

    const buffer = document.createElement('canvas');
    buffer.width = width;
    buffer.height = height;
    const bctx = buffer.getContext('2d');
    if (!bctx) return;

    const dstImage = bctx.createImageData(width, height);
    const dstData = dstImage.data;

    const srcData = src.data;
    const sw = src.width;
    const sh = src.height;

    const srcProj = sourceProjection?.();
    const invert = projection.invert.bind(projection);
    const bilinear = interpolate === 'bilinear';

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Inverse-project destination pixel (in chart-space coordinates) to lon/lat.
        // When `resolution !== 1`, scale the sample point back to chart coordinates.
        const lonlat = invert([x / resolution, y / resolution]);
        if (!lonlat) continue;

        const lon = lonlat[0];
        const lat = lonlat[1];
        if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;

        let sx: number;
        let sy: number;

        if (srcProj) {
          const p = srcProj([lon, lat]);
          if (!p) continue;
          sx = p[0];
          sy = p[1];
        } else {
          // Equirectangular source (plate carrée) — the default for most
          // full-globe imagery like NASA Blue Marble.
          sx = ((lon + 180) / 360) * sw;
          sy = ((90 - lat) / 180) * sh;
        }

        if (!(sx >= 0 && sx < sw && sy >= 0 && sy < sh)) continue;

        const di = (y * width + x) * 4;

        if (bilinear) {
          const x0 = Math.floor(sx);
          const y0 = Math.floor(sy);
          const x1 = Math.min(x0 + 1, sw - 1);
          const y1 = Math.min(y0 + 1, sh - 1);
          const fx = sx - x0;
          const fy = sy - y0;
          const w00 = (1 - fx) * (1 - fy);
          const w10 = fx * (1 - fy);
          const w01 = (1 - fx) * fy;
          const w11 = fx * fy;
          const i00 = (y0 * sw + x0) * 4;
          const i10 = (y0 * sw + x1) * 4;
          const i01 = (y1 * sw + x0) * 4;
          const i11 = (y1 * sw + x1) * 4;
          dstData[di] =
            srcData[i00] * w00 + srcData[i10] * w10 + srcData[i01] * w01 + srcData[i11] * w11;
          dstData[di + 1] =
            srcData[i00 + 1] * w00 +
            srcData[i10 + 1] * w10 +
            srcData[i01 + 1] * w01 +
            srcData[i11 + 1] * w11;
          dstData[di + 2] =
            srcData[i00 + 2] * w00 +
            srcData[i10 + 2] * w10 +
            srcData[i01 + 2] * w01 +
            srcData[i11 + 2] * w11;
          dstData[di + 3] =
            srcData[i00 + 3] * w00 +
            srcData[i10 + 3] * w10 +
            srcData[i01 + 3] * w01 +
            srcData[i11 + 3] * w11;
        } else {
          const sxi = sx | 0;
          const syi = sy | 0;
          const si = (syi * sw + sxi) * 4;
          dstData[di] = srcData[si];
          dstData[di + 1] = srcData[si + 1];
          dstData[di + 2] = srcData[si + 2];
          dstData[di + 3] = srcData[si + 3];
        }
      }
    }

    bctx.putImageData(dstImage, 0, 0);

    // Clip to the projection's sphere so pixels outside the visible region
    // (e.g. the far hemisphere of an orthographic globe) aren't drawn. For
    // non-clipped projections (mercator, etc.) the sphere still renders as a
    // finite region covering the full map.
    dstCtx.save();
    const pathGen = geoPath(projection, dstCtx);
    dstCtx.beginPath();
    pathGen({ type: 'Sphere' });
    dstCtx.clip();

    const prevSmoothing = dstCtx.imageSmoothingEnabled;
    if (pixelated) dstCtx.imageSmoothingEnabled = false;
    dstCtx.drawImage(buffer, 0, 0, ctx.width, ctx.height);
    if (pixelated) dstCtx.imageSmoothingEnabled = prevSmoothing;

    dstCtx.restore();
  }

  if (layerCtx === 'canvas') {
    ctx.registerComponent({
      name: 'GeoRaster',
      kind: 'mark',
      canvasRender: {
        render,
        deps: () => [
          source,
          geo.projection,
          ctx.width,
          ctx.height,
          interpolate,
          resolution,
          pixelated,
          sourceProjection,
        ],
      },
    });
  }
</script>
