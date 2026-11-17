import { describe, expect, it } from 'vitest';
import { ancestor, sampleElevation, tileCover, tileLatitude, tileLongitude } from './tiles.js';

describe('tileCover', () => {
  // Expected tiles are what `d3-tile` (and so LayerChart's `GeoTile`) picks for the same view:
  // its `scale` is the world's width, ours the projection's (the world's radius)
  it('picks the tiles d3-tile does for a view', () => {
    expect(
      tileCover({ scale: 512 / (2 * Math.PI), center: [200, 150], width: 400, height: 300 })
    ).toEqual([
      [0, 0, 1],
      [1, 0, 1],
      [0, 1, 1],
      [1, 1, 1],
    ]);
  });

  it('goes a zoom deeper with `zoomDelta`, leaving out tiles off the view', () => {
    const tiles = tileCover({
      scale: 1024 / (2 * Math.PI),
      center: [200, 150],
      width: 400,
      height: 300,
      zoomDelta: 1,
    });
    expect(tiles).toHaveLength(16);
    expect(tiles.every(([, , z]) => z === 3)).toBe(true);
    expect(tiles[0]).toEqual([2, 2, 3]);
    expect(tiles.at(-1)).toEqual([5, 5, 3]);
  });
});

describe('tile math', () => {
  it('places tile corners on Earth', () => {
    expect(tileLongitude(0, 0)).toBe(-180);
    expect(tileLatitude(0, 0)).toBeCloseTo(85.0511, 3);
    // The middle of the world at zoom 1
    expect(tileLongitude(1, 1)).toBe(0);
    expect(tileLatitude(1, 1)).toBeCloseTo(0);
  });

  it('finds the part of an ancestor a deeper tile shows', () => {
    expect(ancestor([5, 6, 4], 2)).toEqual({ tile: [1, 1, 2], u0: 0.25, v0: 0.5, size: 0.25 });
    // No deeper than it needs to go: itself
    expect(ancestor([5, 6, 4], 10)).toEqual({ tile: [5, 6, 4], u0: 0, v0: 0, size: 1 });
  });

  it('samples elevation between pixels', () => {
    const tile = { width: 2, height: 1, data: new Float32Array([0, 100]) };
    expect(sampleElevation(tile, 0.5, 0.5)).toBeCloseTo(50);
    expect(sampleElevation(tile, 0, 0.5)).toBeCloseTo(0);
  });
});
