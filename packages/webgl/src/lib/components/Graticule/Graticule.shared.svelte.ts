import type { GeoPathProps } from '../GeoPath/GeoPath.shared.svelte.js';

type LineProps = Partial<Omit<GeoPathProps, 'geojson'>>;

export type GraticuleProps = {
  /** Each meridian and parallel as its own line, styled by these (or the graticule's) props */
  lines?: LineProps | boolean;
  /** The graticule's outline, styled by these (or the graticule's) props */
  outline?: LineProps | boolean;
  /** Degrees between meridians. @default 10 */
  stepX?: number;
  /** Degrees between parallels. @default 10 */
  stepY?: number;
} & LineProps;
