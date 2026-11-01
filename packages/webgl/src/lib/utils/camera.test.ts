import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';

import { fitOrthographic, fitPerspective, viewAngles, viewDirection } from './camera.js';

const box = { width: 400, height: 300, depth: 150 };

function corners() {
  const result: Vector3[] = [];
  for (const x of [-200, 200])
    for (const y of [-75, 75]) for (const z of [-150, 150]) result.push(new Vector3(x, y, z));
  return result;
}

describe('viewDirection', () => {
  it('looks from the front at `rotate: 0`, and from above at `tilt: 0`', () => {
    const front = viewDirection(0, 90);
    expect(front.x).toBeCloseTo(0);
    expect(front.y).toBeCloseTo(0);
    expect(front.z).toBeCloseTo(1);
    expect(viewDirection(0, 0).y).toBeCloseTo(1, 3);
  });

  it("turns the floor clockwise, so `rotate: -45` sees it from the front left (`isometric`'s origin corner)", () => {
    const d = viewDirection(-45, 60);
    expect(d.x).toBeLessThan(0);
    expect(d.z).toBeGreaterThan(0);
  });

  it('round-trips through viewAngles', () => {
    const { rotate, tilt } = viewAngles(viewDirection(-30, 65));
    expect(rotate).toBeCloseTo(-30);
    expect(tilt).toBeCloseTo(65);
  });
});

describe('fitPerspective', () => {
  it('puts every corner of the box inside the frustum, one of them on its edge', () => {
    const fov = 35;
    const aspect = 16 / 9;
    const direction = viewDirection(-45, 60);
    const distance = fitPerspective(box, direction, fov, aspect);

    const forward = direction.clone().negate();
    const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize();
    const up = new Vector3().crossVectors(right, forward);
    const tanV = Math.tan(((fov / 2) * Math.PI) / 180);
    const tanH = tanV * aspect;

    let tightest = 0;
    for (const corner of corners()) {
      const depth = distance + corner.dot(forward);
      expect(depth).toBeGreaterThan(0);
      const h = Math.abs(corner.dot(right)) / depth / tanH;
      const v = Math.abs(corner.dot(up)) / depth / tanV;
      expect(h).toBeLessThanOrEqual(1 + 1e-9);
      expect(v).toBeLessThanOrEqual(1 + 1e-9);
      tightest = Math.max(tightest, h, v);
    }
    expect(tightest).toBeCloseTo(1);
  });
});

describe('fitOrthographic', () => {
  it('matches the layer aspect and covers every corner', () => {
    const direction = viewDirection(-45, 60);
    const { halfWidth, halfHeight } = fitOrthographic(box, direction, 2);
    expect(halfWidth / halfHeight).toBeCloseTo(2);

    const forward = direction.clone().negate();
    const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize();
    const up = new Vector3().crossVectors(right, forward);
    for (const corner of corners()) {
      expect(Math.abs(corner.dot(right))).toBeLessThanOrEqual(halfWidth + 1e-9);
      expect(Math.abs(corner.dot(up))).toBeLessThanOrEqual(halfHeight + 1e-9);
    }
  });
});
