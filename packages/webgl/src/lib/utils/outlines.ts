import { Vector3 } from 'three';

import type { Instance } from './instances.svelte.js';
import { getChartContext } from 'layerchart';
import { createMerged } from './merged.svelte.js';

/** A box's footprint: its four corners, as shares of its width and depth from its corner */
const BOX: [number, number][] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

/**
 * An instance's outline, as lines in the scene's axes: around its top, and up each corner when it
 * stands any height (and `upright`), turned as it's turned.  `footprint` is its outline on the floor, as shares of
 * its width and depth from its corner (a box's four corners by default), or pixels for an
 * instance a pixel across (ex. a `Bin` cell's polygon about its center).
 */
export function instanceOutline(
  instance: Pick<Instance, 'x' | 'y' | 'z' | 'width' | 'depth' | 'height' | 'rotation'>,
  footprint: [number, number][] = BOX,
  upright = true
): number[][] {
  const { x, y, z, width, depth, height, rotation } = instance;
  const point = new Vector3();
  const at = (u: number, up: number, v: number) => {
    point.set(u * width, up * height, v * depth);
    if (rotation) point.applyQuaternion(rotation);
    return [x + point.x, z + point.y, y + point.z];
  };
  const lines = [[...footprint, footprint[0]].flatMap(([u, v]) => at(u, 1, v))];
  if (upright && height > 0)
    for (const [u, v] of footprint) lines.push([...at(u, 0, v), ...at(u, 1, v)]);
  return lines;
}

/**
 * Outline a mark's instances (see `instanceOutline`) in `stroke`, `strokeWidth` pixels wide at
 * any depth.  `instances` hands back none when the mark isn't outlined, so it costs nothing then.
 * Pair with `createInstances`' `behind`, so the outlines win the depth ties along the edges.
 * Call during component setup.
 */
export function createOutlines({
  instances,
  stroke,
  strokeWidth,
  opacity,
  footprint,
  dash,
}: {
  instances: () => Instance[];
  stroke: (d: any) => string;
  strokeWidth: () => number;
  opacity: () => number;
  footprint?: () => [number, number][];
  /** Dash the outlines (see `createMerged`'s `dash`) */
  dash?: () => number | number[] | string | undefined;
}) {
  const ctx = getChartContext();
  createMerged({
    items: () => {
      const shape = footprint?.();
      // Seen from straight above (no `view`), a corner's line is a point: only its top's drawn
      const upright = !!ctx.view;
      return instances().map((instance) => ({
        d: instance.d,
        geometry: null,
        fill: null,
        lines: instanceOutline(instance, shape, upright),
        stroke: stroke(instance.d),
      }));
    },
    opacity,
    // Outlines are lines: the merged mark's `opacity` is its fills'
    lineOpacity: opacity,
    strokeWidth,
    dash,
  });
}
