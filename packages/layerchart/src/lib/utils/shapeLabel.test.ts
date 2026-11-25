import { describe, expect, it } from 'vitest';
import { shapeLabel, type ShapeLabelPolygon } from './shapeLabel.js';

const rect = (x: number, y: number, width: number, height: number): ShapeLabelPolygon => [
  [
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height],
    [x, y],
  ],
];

describe('shapeLabel', () => {
  it('finds the center of a square', () => {
    const result = shapeLabel(rect(0, 0, 100, 100));
    expect(result.x).toBeCloseTo(50, 0);
    expect(result.y).toBeCloseTo(50, 0);
    expect(result.distance).toBeCloseTo(50, 0);
  });

  it('stays inside a concave shape, unlike its centroid', () => {
    // An L 20 wide, whose roomiest spot is at its elbow: on the diagonal, as far from the outer
    // edges (x) as from the inner corner (√2 × (20 - x)), so x = 20√2 / (1 + √2)
    const l: ShapeLabelPolygon = [
      [
        [0, 0],
        [100, 0],
        [100, 20],
        [20, 20],
        [20, 100],
        [0, 100],
        [0, 0],
      ],
    ];
    const result = shapeLabel(l);
    expect(Math.abs(result.distance - (20 * Math.SQRT2) / (1 + Math.SQRT2))).toBeLessThan(1);
    expect(result.x <= 20 || result.y <= 20).toBe(true);
  });

  it('avoids holes', () => {
    // The roomiest spots are on the diagonals, as far from the outer edges (x) as from the hole's
    // corner (√2 × (30 - x)), so x = 30√2 / (1 + √2)
    const donut: ShapeLabelPolygon = [...rect(0, 0, 100, 100), ...rect(30, 30, 40, 40)];
    const result = shapeLabel(donut);
    const inHole = result.x > 30 && result.x < 70 && result.y > 30 && result.y < 70;
    expect(inHole).toBe(false);
    expect(Math.abs(result.distance - (30 * Math.SQRT2) / (1 + Math.SQRT2))).toBeLessThan(1);
  });

  it('picks the roomiest of several polygons', () => {
    const result = shapeLabel([rect(0, 0, 10, 10), rect(100, 100, 40, 40)]);
    expect(result.x).toBeCloseTo(120, 0);
    expect(result.y).toBeCloseTo(120, 0);
    expect(result.distance).toBeCloseTo(20, 0);
  });

  it('settles ties at the centroid with `centroidWeight`', () => {
    // Every point along the middle line of a long rectangle is equally far from its edges
    const result = shapeLabel(rect(0, 0, 200, 20), { centroidWeight: 0.01 });
    expect(result.x).toBeCloseTo(100, 0);
    expect(result.y).toBeCloseTo(10, 0);
  });

  it('measures the room for a box of `aspect`', () => {
    // A 200×20 rectangle fits a circle of radius 10, but an ellipse 10× as wide of radii 100 × 10
    const result = shapeLabel(rect(0, 0, 200, 20), { aspect: 10, centroidWeight: 0.01 });
    expect(result.x).toBeCloseTo(100, 0);
    expect(result.y).toBeCloseTo(10, 0);
    expect(result.distance).toBeCloseTo(100, -1);
  });

  it("finds the largest square with `fit: 'rect'`", () => {
    // A right triangle's largest circle has radius 100 × (2 - √2) / 2, but its largest square sits
    // in the right angle with sides of 50
    const triangle: ShapeLabelPolygon = [
      [
        [0, 0],
        [100, 0],
        [0, 100],
        [0, 0],
      ],
    ];
    expect(shapeLabel(triangle).distance).toBeCloseTo((100 * (2 - Math.SQRT2)) / 2, 0);
    const square = shapeLabel(triangle, { fit: 'rect' });
    expect(square.distance).toBeCloseTo(25, 0);
    expect(square.x).toBeCloseTo(25, 0);
    expect(square.y).toBeCloseTo(25, 0);

    // A diamond fits a circle of radius 10 / √2, but a square of only 5 either side of its center
    const diamond: ShapeLabelPolygon = [
      [
        [0, -10],
        [10, 0],
        [0, 10],
        [-10, 0],
        [0, -10],
      ],
    ];
    expect(shapeLabel(diamond).distance).toBeCloseTo(10 / Math.SQRT2, 0);
    expect(shapeLabel(diamond, { fit: 'rect' }).distance).toBeCloseTo(5, 0);
  });

  it("finds the largest rectangle of `aspect` with `fit: 'rect'`", () => {
    // A diamond twice as wide as it's tall fits a 2:1 rectangle half as wide and tall as itself
    const diamond: ShapeLabelPolygon = [
      [
        [0, -10],
        [20, 0],
        [0, 10],
        [-20, 0],
        [0, -10],
      ],
    ];
    const result = shapeLabel(diamond, { fit: 'rect', aspect: 2 });
    expect(result.distance).toBeCloseTo(10, 0);
    expect(result.x).toBeCloseTo(0, 0);
    expect(result.y).toBeCloseTo(0, 0);
  });

  it('finds the point nearest the visual center with `minDistance` of room', () => {
    // A square body, with a long thin arm along its top: a wide label (aspect 4) has enough room
    // at the body's visual center (its largest circle's), so goes there
    const shape: ShapeLabelPolygon = [
      [
        [0, 0],
        [300, 0],
        [300, 30],
        [100, 30],
        [100, 100],
        [0, 100],
        [0, 0],
      ],
    ];
    const center = shapeLabel(shape);
    const result = shapeLabel(shape, { aspect: 4, minDistance: 40 });
    expect(result.x).toBeCloseTo(center.x, 0);
    expect(result.y).toBeCloseTo(center.y, 0);
    expect(result.distance).toBeGreaterThanOrEqual(40);
  });

  it('falls back to the most room when nothing has `minDistance`', () => {
    const result = shapeLabel(rect(0, 0, 100, 20), { minDistance: 50 });
    expect(result.distance).toBeCloseTo(10, 0);
  });

  it('keeps a `prefer` point that has `minDistance` and nearly as much room', () => {
    // Two blocks joined by a thin bar: `right` × `right` on the right, 60 × 60 on the left
    const blocks = (right: number): ShapeLabelPolygon => [
      [
        [0, 0],
        [60, 0],
        [60, 25],
        [140, 25],
        [140, 30 - right / 2],
        [140 + right, 30 - right / 2],
        [140 + right, 30 + right / 2],
        [140, 30 + right / 2],
        [140, 35],
        [60, 35],
        [60, 60],
        [0, 60],
        [0, 0],
      ],
    ];

    // Equal blocks: either is kept
    for (const x of [30, 170]) {
      expect(shapeLabel(blocks(60), { minDistance: 15, prefer: { x, y: 30 } }).x).toBe(x);
    }

    // A smaller right block (room 20, under 90% of the left's 30): not kept, though it fits
    expect(shapeLabel(blocks(40), { minDistance: 15, prefer: { x: 160, y: 30 } }).x).toBeLessThan(
      60
    );

    // Without room for it (the bar is only 10 tall)
    expect(shapeLabel(blocks(60), { minDistance: 15, prefer: { x: 100, y: 30 } }).x).not.toBe(100);
  });

  it('handles degenerate polygons', () => {
    expect(shapeLabel([[]]).distance).toBe(0);
    expect(shapeLabel(rect(5, 5, 0, 0)).distance).toBe(0);
  });
});
