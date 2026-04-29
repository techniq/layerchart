import type { SVGAttributes } from 'svelte/elements';
import type { Without } from '$lib/utils/types.js';

export const tileCache = new Map<string, Promise<string>>();

export type TileImagePropsWithoutHTML = {
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
  scale: number;
  /** @default false */
  disableCache?: boolean;
  /** @default false */
  debug?: boolean;
  url: (x: number, y: number, z: number) => string;
};

export type TileImageProps = TileImagePropsWithoutHTML &
  Omit<Without<SVGAttributes<SVGImageElement>, TileImagePropsWithoutHTML>, 'href'>;
