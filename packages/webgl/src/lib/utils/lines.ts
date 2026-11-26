import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

import type { ResolvedColor } from './color.js';

/**
 * Line segments drawn a number of screen pixels wide at any depth, as an SVG stroke is (a plain
 * line is always one pixel wide, whatever width it's given): ex. a mark's contour or grid lines
 */
export function createSegments() {
  const material = new LineMaterial({ transparent: true, depthWrite: false });
  const object = new LineSegments2(new LineSegmentsGeometry(), material);
  object.visible = false;
  return {
    object,
    /**
     * Draw these segments, each a pair of points, as `[x, y, z, x, y, z, ...]` in the scene, in
     * each point's own color (`[r, g, b, ...]`, linear, under their `style` color) when given
     */
    set(segments: ArrayLike<number>, colors?: ArrayLike<number>) {
      object.geometry.dispose();
      object.geometry = new LineSegmentsGeometry();
      object.visible = segments.length >= 6;
      if (object.visible) object.geometry.setPositions(segments as number[]);
      if (object.visible && colors) object.geometry.setColors(colors as number[]);
      if (material.vertexColors !== !!colors) {
        material.vertexColors = !!colors;
        material.needsUpdate = true;
      }
    },
    /** Their color (and its alpha) and width in pixels */
    style(color: ResolvedColor | null, width: number) {
      if (color) {
        material.color.copy(color.color);
        material.opacity = color.opacity;
      }
      material.linewidth = width;
    },
    dispose() {
      object.geometry.dispose();
      material.dispose();
    },
  };
}
