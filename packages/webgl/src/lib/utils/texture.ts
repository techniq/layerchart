import { CanvasTexture, SRGBColorSpace, Texture, TextureLoader } from 'three';

/** An image to draw on a mark: a URL, or something already drawn (ex. a canvas of map tiles) */
export type ImageSource = string | HTMLImageElement | HTMLCanvasElement | ImageBitmap;

/**
 * A texture for `source`, calling `onLoad` once a URL's image has arrived (loaded with
 * `crossOrigin`, `'anonymous'` unless given; `null` for none)
 */
export function loadTexture(
  source: ImageSource,
  onLoad: () => void,
  { crossOrigin = 'anonymous' }: { crossOrigin?: string | null } = {}
): Texture {
  let texture: Texture;
  if (typeof source === 'string') {
    const loader = new TextureLoader();
    // `null` leaves the image's `crossOrigin` unset
    loader.setCrossOrigin(crossOrigin as string);
    texture = loader.load(source, onLoad);
  } else {
    texture = source instanceof HTMLCanvasElement ? new CanvasTexture(source) : new Texture(source);
    texture.needsUpdate = true;
  }
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
