import { CanvasTexture, SRGBColorSpace, Texture, TextureLoader } from 'three';

/** An image to draw on a mark: a URL, or something already drawn (ex. a canvas of map tiles) */
export type ImageSource = string | HTMLImageElement | HTMLCanvasElement | ImageBitmap;

/** A texture for `source`, calling `onLoad` once a URL's image has arrived */
export function loadTexture(source: ImageSource, onLoad: () => void): Texture {
  let texture: Texture;
  if (typeof source === 'string') {
    const loader = new TextureLoader();
    loader.setCrossOrigin('anonymous');
    texture = loader.load(source, onLoad);
  } else {
    texture = source instanceof HTMLCanvasElement ? new CanvasTexture(source) : new Texture(source);
    texture.needsUpdate = true;
  }
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
