/**
 * Where to label a shape (or place an image in it): its pole of inaccessibility, the point inside
 * it farthest from its edges, where there's the most room.  Unlike the centroid, it is always
 * inside, even for concave shapes (ex. Florida) or ones with holes.
 *
 * Adapted from Mapbox's polylabel (ISC, © Mapbox: https://github.com/mapbox/polylabel), with:
 * - `aspect` to find the most room for a box of that shape (ex. a label's text) rather than a
 *   circle ("stretched polylabel")
 * - `fit: 'rect'` for the largest rectangle (of `aspect`, a square by default) rather than circle
 *   (or ellipse), measuring to the edges by the larger of the horizontal and vertical gaps
 * - `centroidWeight` to settle ties (ex. a rectangle, whose best points form a line) near the
 *   centroid (https://github.com/mapbox/polylabel/pull/63)
 * - `minDistance` for the point nearest the visual center with enough room, rather than the most
 * - `prefer` to keep a point (ex. a label's last position) while it's about as good
 * - multiple polygons (the best spot across all of them)
 */

/** Ring of `[x, y]` points (closed or not) */
export type ShapeLabelRing = [number, number][];
/** An outer ring followed by any holes */
export type ShapeLabelPolygon = ShapeLabelRing[];

export type ShapeLabelOptions = {
  /** How close to the best point to search (in the polygon's units). @default 1 */
  precision?: number;
  /**
   * Width / height of what is being placed, to find the most room for a box of that shape rather
   * than a circle (ex. `textWidth / fontSize` for a label).  @default 1
   */
  aspect?: number;
  /**
   * What must fit: a `'circle'` (an ellipse with an `aspect`), or a `'rect'`angle (a square, or a
   * rectangle of `aspect`), ex. to place an image within the shape without clipping its corners.
   * @default 'circle'
   */
  fit?: 'circle' | 'rect';
  /**
   * How much to prefer points near the centroid over slightly roomier ones farther away, settling
   * ties such as a rectangle (whose best points form a line) at its center.  `0` to disable.
   * @default 0
   */
  centroidWeight?: number;
  /**
   * Room that's enough (ex. half a label's width, with `aspect`): the point nearest the polygon's
   * visual center (the center of its largest circle, ties settled near the centroid by
   * `centroidWeight`) at least this far from the edges, rather than the farthest.  Unlike the
   * centroid, the visual center stays within the body of a concave shape (ex. the middle of
   * Florida's peninsula).  Falls back to the farthest when no point has that much room.
   */
  minDistance?: number;
  /**
   * A point to keep (ex. a label's previous position) while it has `minDistance` of room (give or
   * take 2 × `precision`) and at least 75% of the visual center's room, so a label doesn't jump
   * between about equally good spots as its shape changes (ex. on resize)
   */
  prefer?: { x: number; y: number };
};

export type ShapeLabelResult = {
  x: number;
  y: number;
  /**
   * Distance from the point to the nearest edge (the radius of the largest circle that fits).  With
   * an `aspect`, the horizontal radius of the largest ellipse of that shape (its vertical radius is
   * `distance / aspect`).  With `fit: 'rect'`, half the width of the largest square or rectangle
   * (half its height is `distance / aspect`).
   */
  distance: number;
};

/**
 * The point inside `polygon` (or across several polygons) farthest from its edges.
 *
 * ```ts
 * const { x, y, distance } = shapeLabel([[[0, 0], [100, 0], [100, 50], [0, 50]]]);
 * ```
 */
export function shapeLabel(
  polygon: ShapeLabelPolygon | ShapeLabelPolygon[],
  options: ShapeLabelOptions = {}
): ShapeLabelResult {
  const { precision = 1, aspect = 1, centroidWeight = 0, minDistance, prefer } = options;
  const rect = options.fit === 'rect';
  const polygons = isMultiPolygon(polygon) ? polygon : [polygon];

  // The roomiest polygon, and its roomiest point
  let best: {
    original: ShapeLabelPolygon;
    polygon: ShapeLabelPolygon;
    result: ShapeLabelResult;
  } | null = null;
  for (const p of polygons) {
    if (!p[0]?.length) continue;
    // Stretch vertically so a box of `aspect` becomes a square, find the largest circle (or
    // square), unstretch
    const stretched =
      aspect === 1 ? p : p.map((ring) => ring.map(([x, y]): [number, number] => [x, y * aspect]));
    const result = poleOfInaccessibility(
      stretched,
      precision,
      mostRoom(centroidWeight, precision),
      {
        rect,
      }
    );
    if (!best || result.distance > best.result.distance) {
      best = { original: p, polygon: stretched, result };
    }
  }
  if (!best) return { x: NaN, y: NaN, distance: 0 };

  let { result } = best;
  if (minDistance != null && result.distance >= minDistance) {
    // Enough room somewhere: the point with enough that's nearest the visual center (the center of
    // the largest circle, not of a box of `aspect` or a square)
    const center =
      aspect === 1 && !rect
        ? result
        : poleOfInaccessibility(best.original, precision, mostRoom(centroidWeight, precision));
    const anchor = { x: center.x, y: center.y * aspect };
    const nearest = poleOfInaccessibility(best.polygon, precision, nearestRoom(minDistance), {
      guesses: [result, anchor],
      anchor,
      rect,
    });
    if (nearest.distance >= minDistance) result = nearest;

    if (prefer) {
      const kept = keepPreferred(best, prefer, aspect, rect, center, minDistance, precision);
      if (kept) result = kept;
    }
  }
  return { x: result.x, y: result.y / aspect, distance: result.distance };
}

/**
 * `prefer` (in the polygon's stretched space) if a box of `aspect` has `minDistance` of room there
 * (give or take 2 × `precision`, as a point found at the edge of having enough can come up a
 * fraction short as the shape changes), and it has at least 75% of the visual `center`'s room.
 * Judged by its own room rather than its distance to the center, which can move between
 * equally roomy spots (ex. a band's thick stretches) as the shape changes.
 */
function keepPreferred(
  shape: { original: ShapeLabelPolygon; polygon: ShapeLabelPolygon },
  prefer: { x: number; y: number },
  aspect: number,
  rect: boolean,
  center: ShapeLabelResult,
  minDistance: number,
  precision: number
): ShapeLabelResult | null {
  const distance = distanceAt(shape.polygon, prefer.x, prefer.y * aspect, rect);
  if (distance < minDistance - 2 * precision) return null;
  if (distanceAt(shape.original, prefer.x, prefer.y) < 0.75 * center.distance) return null;
  return { x: prefer.x, y: prefer.y * aspect, distance };
}

/**
 * Signed distance from a point to the polygon's edges (negative if outside), by the larger of the
 * horizontal and vertical gaps with `rect`
 */
function distanceAt(polygon: ShapeLabelPolygon, x: number, y: number, rect = false) {
  const cell = { x, y, h: 0, d: 0, fitness: 0, max: 0, edge: [0, 0, 0, 0] } as Cell;
  return distanceToOutline(cell, createOutline(polygon, rect), -Infinity, false);
}

/** How a point scores, and the most any point within `reach` of it could */
type Scoring = {
  fitness: (d: number, toCentroid: number) => number;
  max: (d: number, toCentroid: number, reach: number) => number;
  /**
   * Distance from the edges below which a point can't beat `best` (nor a point within `reach`),
   * so its distance scan can stop there (`-Infinity` to always finish it)
   */
  useless: (best: number, toCentroid: number, reach: number) => number;
};

/** The most room, less `centroidWeight` × the distance to the centroid */
function mostRoom(centroidWeight: number, precision: number): Scoring {
  const pull = (toCentroid: number) => centroidWeight * toCentroid;
  const reachablePull = (toCentroid: number, reach: number) =>
    centroidWeight * Math.max(0, toCentroid - reach);
  return {
    fitness: (d, toCentroid) => d - pull(toCentroid),
    max: (d, toCentroid, reach) => d + reach - reachablePull(toCentroid, reach),
    useless: (best, toCentroid, reach) =>
      Math.min(
        best + pull(toCentroid),
        best + precision - reach + reachablePull(toCentroid, reach)
      ),
  };
}

/**
 * Nearest the anchor (`toCentroid` measures to it), a point with less than `minDistance` paying
 * heavily for what it's short
 */
function nearestRoom(minDistance: number): Scoring {
  const SHORT_PENALTY = 10;
  return {
    fitness: (d, toCentroid) => -toCentroid - SHORT_PENALTY * Math.max(0, minDistance - d),
    max: (d, toCentroid, reach) =>
      -Math.max(0, toCentroid - reach) - SHORT_PENALTY * Math.max(0, minDistance - d - reach),
    useless: () => -Infinity,
  };
}

function isMultiPolygon(
  polygon: ShapeLabelPolygon | ShapeLabelPolygon[]
): polygon is ShapeLabelPolygon[] {
  return Array.isArray(polygon[0]?.[0]?.[0]);
}

/** Edges grouped under one bounding box, so the distance scan can skip whole groups */
const BLOCK_SIZE = 32;

/** A polygon's rings, flattened for a fast distance scan */
type Outline = {
  /**
   * Whether distances are the larger of the horizontal and vertical gaps (the half-size of the
   * largest square around a point), rather than straight-line (the radius of the largest circle)
   */
  rect: boolean;
  /** `x, y` of every point, ring after ring */
  coords: Float64Array;
  /** Offset into `coords` where each ring ends */
  ringEnds: number[];
  /** `minX, minY, maxX, maxY` of each block of `BLOCK_SIZE` edges */
  blocks: Float64Array;
};

type Cell = {
  /** Center */
  x: number;
  y: number;
  /** Half the cell's size */
  h: number;
  /** Signed distance from the center to the polygon's edges (negative outside) */
  d: number;
  /** Score to maximize: `d`, less the pull towards the centroid */
  fitness: number;
  /** Best `fitness` possible anywhere within the cell */
  max: number;
  /** Nearest edge found, to check first for the cell's children (usually nearest to it too) */
  edge: [number, number, number, number];
};

/**
 * The best point by `scoring` (searching cells in order of their potential, splitting the
 * promising ones), starting from the centroid, the bounding box's center, and any `guesses`.
 * `scoring` measures to `anchor` (the centroid by default), and room by the largest circle, or
 * square with `rect`.
 */
function poleOfInaccessibility(
  polygon: ShapeLabelPolygon,
  precision: number,
  scoring: Scoring,
  {
    guesses = [],
    anchor,
    rect = false,
  }: {
    guesses?: { x: number; y: number }[];
    anchor?: { x: number; y: number };
    rect?: boolean;
  } = {}
): ShapeLabelResult {
  // Bounding box of the outer ring
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of polygon[0]) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const cellSize = Math.max(precision, Math.min(width, height));
  if (cellSize === precision) {
    return { x: minX + width / 2, y: minY + height / 2, distance: 0 };
  }

  const outline = createOutline(polygon, rect);
  const centroid = getCentroid(polygon);
  const target = anchor ?? centroid;

  /**
   * With `best` (the fitness to beat), the scan stops once a cell can neither beat it nor contain
   * a point that could
   */
  const createCell = (x: number, y: number, h: number, best = -Infinity, parent?: Cell): Cell => {
    const toCentroid = Math.hypot(x - target.x, y - target.y);
    // How far a point in the cell can be from its center, bounding how much its room and distance
    // to the centroid can differ (room by squares differs by at most `h`, which this covers too)
    const reach = h * Math.SQRT2;
    const useless = scoring.useless(best, toCentroid, reach);

    const cell = { x, y, h, d: 0, fitness: 0, max: 0, edge: parent?.edge ?? [0, 0, 0, 0] } as Cell;
    cell.d = distanceToOutline(cell, outline, useless, parent != null);
    cell.fitness = scoring.fitness(cell.d, toCentroid);
    cell.max = scoring.max(cell.d, toCentroid, reach);
    return cell;
  };

  // Centroid as the first guess (if inside), then the bounding box's center (ex. for rectangles)
  let best = createCell(centroid.x, centroid.y, 0);
  if (best.d < 0) best = createCell(polygon[0][0][0], polygon[0][0][1], 0);
  const bboxCell = createCell(minX + width / 2, minY + height / 2, 0);
  if (bboxCell.fitness > best.fitness) best = bboxCell;
  for (const guess of guesses) {
    const guessCell = createCell(guess.x, guess.y, 0);
    if (guessCell.fitness > best.fitness) best = guessCell;
  }

  // Cells in order of their potential
  const queue = new MaxHeap<Cell>((cell) => cell.max);
  const consider = (x: number, y: number, h: number, parent?: Cell) => {
    const cell = createCell(x, y, h, best.fitness, parent);
    if (cell.max > best.fitness + precision) queue.push(cell);
    if (cell.fitness > best.fitness) best = cell;
  };

  const h = cellSize / 2;
  for (let x = minX; x < maxX; x += cellSize) {
    for (let y = minY; y < maxY; y += cellSize) {
      consider(x + h, y + h, h);
    }
  }

  while (queue.size) {
    const cell = queue.pop()!;
    // No remaining cell (in order of potential) has a chance of a better solution
    if (cell.max - best.fitness <= precision) break;

    const childH = cell.h / 2;
    consider(cell.x - childH, cell.y - childH, childH, cell);
    consider(cell.x + childH, cell.y - childH, childH, cell);
    consider(cell.x - childH, cell.y + childH, childH, cell);
    consider(cell.x + childH, cell.y + childH, childH, cell);
  }

  return { x: best.x, y: best.y, distance: Math.max(0, best.d) };
}

function createOutline(polygon: ShapeLabelPolygon, rect = false): Outline {
  const coords = new Float64Array(polygon.reduce((n, ring) => n + ring.length, 0) * 2);
  const ringEnds: number[] = [];
  let c = 0;
  for (const ring of polygon) {
    for (const [x, y] of ring) {
      coords[c++] = x;
      coords[c++] = y;
    }
    ringEnds.push(c);
  }

  // A bounding box over each block of edges (both ends of each, so including the edge into it)
  const stride = BLOCK_SIZE * 2;
  const blocks: number[] = [];
  let ringStart = 0;
  for (const ringEnd of ringEnds) {
    for (let s = ringStart; s < ringEnd; s += stride) {
      const end = Math.min(s + stride, ringEnd);
      const prev = s === ringStart ? ringEnd - 2 : s - 2;
      let bMinX = coords[prev];
      let bMinY = coords[prev + 1];
      let bMaxX = bMinX;
      let bMaxY = bMinY;
      for (let i = s; i < end; i += 2) {
        bMinX = Math.min(bMinX, coords[i]);
        bMaxX = Math.max(bMaxX, coords[i]);
        bMinY = Math.min(bMinY, coords[i + 1]);
        bMaxY = Math.max(bMaxY, coords[i + 1]);
      }
      blocks.push(bMinX, bMinY, bMaxX, bMaxY);
    }
    ringStart = ringEnd;
  }

  return { rect, coords, ringEnds, blocks: Float64Array.from(blocks) };
}

/**
 * Signed distance from a cell's center to the outline (negative if outside), recording its
 * nearest edge.  Returns `useless` as soon as the center is proven no farther than it (the cell
 * can't help), checking the parent's nearest edge first so that happens sooner.
 */
function distanceToOutline(cell: Cell, outline: Outline, useless: number, seeded: boolean) {
  const { x, y } = cell;
  const { rect, coords, ringEnds, blocks } = outline;
  const segmentDistance = rect ? segmentGapSq : segmentDistanceSq;
  const uselessSq = useless > 0 ? useless * useless : -1;
  let inside = false;
  let minDistSq = Infinity;

  if (seeded) {
    const [ax, ay, bx, by] = cell.edge;
    minDistSq = segmentDistance(x, y, ax, ay, bx, by);
    if (minDistSq <= uselessSq) return useless;
  }

  const stride = BLOCK_SIZE * 2;
  let block = 0;
  let ringStart = 0;
  for (const ringEnd of ringEnds) {
    // Previous point, starting from the ring's last
    let bx = coords[ringEnd - 2];
    let by = coords[ringEnd - 1];

    for (let s = ringStart; s < ringEnd; s += stride, block += 4) {
      const end = Math.min(s + stride, ringEnd);
      const bMinX = blocks[block];
      const bMinY = blocks[block + 1];
      const bMaxX = blocks[block + 2];
      const bMaxY = blocks[block + 3];

      // No edge in the block is nearer than the best so far
      const dx = x < bMinX ? bMinX - x : x > bMaxX ? x - bMaxX : 0;
      const dy = y < bMinY ? bMinY - y : y > bMaxY ? y - bMaxY : 0;
      const skipDistance = (rect ? Math.max(dx, dy) ** 2 : dx * dx + dy * dy) >= minDistSq;
      // No edge in the block crosses the ray to the right of the center (inside/outside test)
      const skipCrossing = y < bMinY || y >= bMaxY || x > bMaxX;

      if (skipDistance && skipCrossing) {
        bx = coords[end - 2];
        by = coords[end - 1];
        continue;
      }

      for (let i = s; i < end; i += 2) {
        const ax = coords[i];
        const ay = coords[i + 1];

        if (!skipCrossing && ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) {
          inside = !inside;
        }

        if (!skipDistance) {
          const distSq = segmentDistance(x, y, ax, ay, bx, by);
          if (distSq < minDistSq) {
            minDistSq = distSq;
            cell.edge = [ax, ay, bx, by];
            if (minDistSq <= uselessSq) return useless;
          }
        }

        bx = ax;
        by = ay;
      }
    }
    ringStart = ringEnd;
  }

  return minDistSq === 0 ? 0 : (inside ? 1 : -1) * Math.sqrt(minDistSq);
}

/** Squared distance from a point to a segment */
function segmentDistanceSq(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  let x = ax;
  let y = ay;
  const dx = bx - ax;
  const dy = by - ay;
  if (dx !== 0 || dy !== 0) {
    const t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = bx;
      y = by;
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  return (px - x) ** 2 + (py - y) ** 2;
}

/**
 * Squared distance from a point to a segment by the larger of the horizontal and vertical gaps
 * (Chebyshev): the half-size of the largest square around the point clear of the segment
 */
function segmentGapSq(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  // Along the segment, the gap is convex and piecewise linear in `t`, so least at an end or where
  // a side's gap is zero or the two are equal
  const ux = ax - px;
  const uy = ay - py;
  const dx = bx - ax;
  const dy = by - ay;
  const gap = (t: number) => Math.max(Math.abs(ux + t * dx), Math.abs(uy + t * dy));
  let min = Math.min(gap(0), gap(1));
  for (const t of [-ux / dx, -uy / dy, (uy - ux) / (dx - dy), -(ux + uy) / (dx + dy)]) {
    if (t > 0 && t < 1) min = Math.min(min, gap(t));
  }
  return min * min;
}

/** Centroid of the outer ring */
function getCentroid(polygon: ShapeLabelPolygon) {
  const ring = polygon[0];
  let area = 0;
  let x = 0;
  let y = 0;
  for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
    const [ax, ay] = ring[i];
    const [bx, by] = ring[j];
    const f = ax * by - bx * ay;
    x += (ax + bx) * f;
    y += (ay + by) * f;
    area += f * 3;
  }
  return area === 0 ? { x: ring[0][0], y: ring[0][1] } : { x: x / area, y: y / area };
}

/** Binary max-heap */
class MaxHeap<T> {
  #items: T[] = [];
  #value: (item: T) => number;

  constructor(value: (item: T) => number) {
    this.#value = value;
  }

  get size() {
    return this.#items.length;
  }

  push(item: T) {
    const items = this.#items;
    items.push(item);
    let i = items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.#value(items[parent]) >= this.#value(item)) break;
      items[i] = items[parent];
      i = parent;
    }
    items[i] = item;
  }

  pop(): T | undefined {
    const items = this.#items;
    const top = items[0];
    const last = items.pop();
    if (items.length && last !== undefined) {
      let i = 0;
      const half = items.length >> 1;
      while (i < half) {
        let child = 2 * i + 1;
        const right = child + 1;
        if (right < items.length && this.#value(items[right]) > this.#value(items[child])) {
          child = right;
        }
        if (this.#value(items[child]) <= this.#value(last)) break;
        items[i] = items[child];
        i = child;
      }
      items[i] = last;
    }
    return top;
  }
}
