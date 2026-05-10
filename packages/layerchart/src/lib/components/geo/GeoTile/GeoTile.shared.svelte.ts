import type { ComponentProps, Snippet } from 'svelte';
import type Group from '../../Group/Group.svelte';

export type GeoTilePropsWithoutHTML = {
  url: (x: number, y: number, z: number) => string;
  /** @default 0 */
  zoomDelta?: number;
  /** @default 256 */
  tileSize?: number;
  /** @default false */
  disableCache?: boolean;
  group?: Partial<ComponentProps<typeof Group>>;
  /** @default false */
  debug?: boolean;
  children?: Snippet<[{ tiles: any[] }]>;
};
