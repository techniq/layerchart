import { BufferGeometry, ExtrudeGeometry, ShapeGeometry, ShapePath, type Path } from 'three';

/**
 * A canvas-like drawing context (as `d3-geo`'s `geoPath` and `d3-shape`'s generators draw to)
 * that records into a three.js `ShapePath` for filling, and polylines for stroking.  Shapes are
 * kept with `y` flipped, so a rotation stands them on the floor (see `extrude`).
 */
export class ShapeContext {
  readonly path = new ShapePath();
  /** Every outline drawn, as `[x, y]` points in chart pixels */
  readonly lines: [number, number][][] = [];
  #line: [number, number][] | null = null;
  #start: [number, number] | null = null;

  moveTo(x: number, y: number) {
    this.path.moveTo(x, -y);
    this.#line = [[x, y]];
    this.lines.push(this.#line);
    this.#start = [x, y];
  }

  lineTo(x: number, y: number) {
    if (!this.#line) return this.moveTo(x, y);
    this.path.lineTo(x, -y);
    this.#line.push([x, y]);
  }

  closePath() {
    (this.path.currentPath as Path | null)?.closePath();
    if (this.#line && this.#start) this.#line.push([...this.#start]);
  }

  quadraticCurveTo(cx: number, cy: number, x: number, y: number) {
    this.path.quadraticCurveTo(cx, -cy, x, -y);
    this.#line?.push([x, y]);
  }

  bezierCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number) {
    this.path.bezierCurveTo(c1x, -c1y, c2x, -c2y, x, -y);
    this.#line?.push([x, y]);
  }

  arc(x: number, y: number, r: number, a0: number, a1: number, ccw = false) {
    // Flipping `y` mirrors angles, and with them which way round the arc goes
    const start: [number, number] = [x + r * Math.cos(a0), y + r * Math.sin(a0)];
    if (!this.#line) this.moveTo(...start);
    else this.lineTo(...start);
    (this.path.currentPath as Path).absarc(x, -y, r, -a0, -a1, !ccw);
    // Outlines follow the arc in steps
    const sweep = ccw ? a0 - a1 : a1 - a0;
    const steps = Math.max(2, Math.ceil((Math.abs(sweep) / Math.PI) * 16));
    for (let i = 1; i <= steps; i++) {
      const a = a0 + ((ccw ? -1 : 1) * Math.abs(sweep) * i) / steps;
      this.#line!.push([x + r * Math.cos(a), y + r * Math.sin(a)]);
    }
  }

  rect(x: number, y: number, w: number, h: number) {
    this.moveTo(x, y);
    this.lineTo(x + w, y);
    this.lineTo(x + w, y + h);
    this.lineTo(x, y + h);
    this.closePath();
  }
}

/**
 * A shape standing on the floor from height `z0` to `z1` (in pixels), in the scene's axes — or
 * lying flat at `z0` when they're (nearly) the same.  `null` when there's nothing to fill.
 */
export function extrude(
  context: ShapeContext,
  z0: number,
  z1: number,
  curveSegments = 8
): BufferGeometry | null {
  const shapes = context.path.toShapes();
  if (!shapes.length) return null;
  const depth = Math.abs(z1 - z0);
  const geometry =
    depth > 0.01
      ? new ExtrudeGeometry(shapes, { depth, bevelEnabled: false, curveSegments })
      : new ShapeGeometry(shapes, curveSegments);
  // The shape's `(x, -y)` and extrusion along `z` turn to the scene's `(x, height, y)`
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, Math.min(z0, z1), 0);
  return geometry;
}
