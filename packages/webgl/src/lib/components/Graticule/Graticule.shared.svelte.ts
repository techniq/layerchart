import type { GeoPathProps } from '../GeoPath/GeoPath.shared.svelte.js';

/**
 * The core `Graticule`'s props (in its order), then the `GeoPath` props it draws its lines with,
 * as the core `Graticule` takes them
 */
export type GraticuleProps = {
  /** Each meridian and parallel as its own line, styled by these (or the graticule's) props */
  lines?: Partial<Omit<GeoPathProps, 'geojson'>> | boolean;
  /** The graticule's outline, styled by these (or the graticule's) props */
  outline?: Partial<Omit<GeoPathProps, 'geojson'>> | boolean;
  /** Degrees between meridians. @default 10 */
  stepX?: number;
  /** Degrees between parallels. @default 10 */
  stepY?: number;
} & Partial<GeoPathProps>;
