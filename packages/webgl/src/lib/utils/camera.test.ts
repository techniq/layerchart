import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';

import { frameOrthographic, framePerspective, viewAngles, viewDirection } from './camera.js';

// A plot box 400 × 300, 150 tall, standing on the floor
const min = new Vector3(-200, 0, -150);
const max = new Vector3(200, 150, 150);

function corners() {
  const result: Vector3[] = [];
  for (const x of [-200, 200])
    for (const y of [0, 150]) for (const z of [-150, 150]) result.push(new Vector3(x, y, z));
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

/** The camera's axes looking along `-direction` */
function axes(direction: Vector3) {
  const forward = direction.clone().negate();
  const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize();
  const up = new Vector3().crossVectors(right, forward);
  return { forward, right, up };
}

describe('framePerspective', () => {
  it('fits every corner of the box in view, centered, as large as it fits', () => {
    const fov = 35;
    const aspect = 16 / 9;
    const direction = viewDirection(-45, 60);
    const { target, distance } = framePerspective(min, max, direction, fov, aspect);
    const { forward, right, up } = axes(direction);
    const camera = target.clone().addScaledVector(direction, distance);
    const tanV = Math.tan(((fov / 2) * Math.PI) / 180);
    const tanH = tanV * aspect;

    const across: number[] = [];
    const above: number[] = [];
    for (const corner of corners()) {
      const offset = corner.clone().sub(camera);
      const depth = offset.dot(forward);
      expect(depth).toBeGreaterThan(0);
      across.push(offset.dot(right) / depth / tanH);
      above.push(offset.dot(up) / depth / tanV);
    }
    // Inside the frame, and as wide (or tall) as it
    for (const v of [...across, ...above]) expect(Math.abs(v)).toBeLessThanOrEqual(1 + 1e-9);
    expect(
      Math.max(Math.max(...across) - Math.min(...across), Math.max(...above) - Math.min(...above))
    ).toBeCloseTo(2);
    // Centered both ways
    expect(Math.max(...across) + Math.min(...across)).toBeCloseTo(0);
    expect(Math.max(...above) + Math.min(...above)).toBeCloseTo(0);
  });
});

describe('frameOrthographic', () => {
  it('matches the layer aspect and covers every corner, centered', () => {
    const direction = viewDirection(-45, 60);
    const { target, halfWidth, halfHeight } = frameOrthographic(min, max, direction, 2);
    expect(halfWidth / halfHeight).toBeCloseTo(2);

    const { right, up } = axes(direction);
    for (const corner of corners()) {
      const offset = corner.clone().sub(target);
      expect(Math.abs(offset.dot(right))).toBeLessThanOrEqual(halfWidth + 1e-9);
      expect(Math.abs(offset.dot(up))).toBeLessThanOrEqual(halfHeight + 1e-9);
    }
  });
});
