import type { ElevationEncoding, Tile } from '../../utils/tiles.js';

/**
 * Elevation tiles to raise a `GeoTile` into terrain: a second tile service beside its imagery,
 * with its own encoding and zoom limit
 */
export type GeoTileElevation = {
  /** An elevation tile's URL from its column, row, and zoom (ex. AWS's open terrain tiles) */
  url: (x: number, y: number, z: number) => string;
  /**
   * How the tiles pack meters into their colors: `'terrarium'` (ex. AWS, Mapterhorn) or
   * `'mapbox'` (Terrain-RGB).
   *
   * @default 'terrarium'
   */
  encoding?: ElevationEncoding;
  /** The deepest zoom the tiles go to: deeper ones use part of an ancestor's (as `maxZoom`) */
  maxZoom?: number;
};

export type GeoTileProps = {
  /** A tile's image URL, from its column, row, and zoom (an XYZ tile service, as the core `GeoTile` takes) */
  url: (x: number, y: number, z: number) => string;
  /**
   * Zoom levels to add to (or take from) the one picked for the view, for sharper (or fewer)
   * tiles.
   *
   * @default 0
   */
  zoomDelta?: number;
  /**
   * Pixels across a tile, for picking the zoom.
   *
   * @default 256
   */
  tileSize?: number;
  /**
   * The deepest zoom the image tiles go to: deeper tiles show part of their ancestor's image,
   * enlarged (ex. imagery that stops at zoom 12 under terrain that doesn't)
   */
  maxZoom?: number;
  /**
   * Raise the tiles into terrain from elevation tiles: their `url`, `encoding`, and `maxZoom`,
   * their meters run through the chart's `z` scale
   */
  elevation?: GeoTileElevation;
  /**
   * Points across each tile's mesh: more follow terrain (or a projection's curves) more closely.
   *
   * @default 64 with `elevation`, else 16
   */
  segments?: number;
  /**
   * Load each image anew rather than from those loaded before.
   *
   * @default false
   */
  disableCache?: boolean;
  /** @default 1 */
  opacity?: number;
  /**
   * Outline each tile, labeled with its zoom / column / row.
   *
   * @default false
   */
  debug?: boolean;
  /**
   * Show the tooltip for the longitude / latitude the pointer is over (with the chart's
   * `tooltipContext`), and its elevation.
   *
   * @default false
   */
  tooltip?: boolean;
  /** The tiles drawn, as `[x, y, z]`, when they change */
  onTilesChange?: (tiles: Tile[]) => void;
};
