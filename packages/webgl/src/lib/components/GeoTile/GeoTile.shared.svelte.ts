import type { Snippet } from 'svelte';
import type { GroupProps } from 'layerchart';
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

/**
 * The core `GeoTile`'s props (in its order, as it describes them), then those of a `WebGL`
 * layer's own (`maxZoom`, `elevation`, `segments`, ...)
 */
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
   * Load each image anew rather than from those loaded before.
   *
   * @default false
   */
  disableCache?: boolean;
  /**
   * Props for the `Group` the tiles are drawn in (ex. `{ opacity: 0.5 }`, or `x` / `y` to move
   * them)
   */
  group?: Partial<GroupProps>;
  /**
   * Outline each tile, labeled with its zoom / column / row.
   *
   * @default false
   */
  debug?: boolean;
  /**
   * Draw in place of the tiles, given those covering the view (each `[x, y, z]`): none of their
   * images load
   */
  children?: Snippet<[{ tiles: Tile[] }]>;

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
  /** The opacity of the tiles. (0 to 1) @default 1 */
  opacity?: number;
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
