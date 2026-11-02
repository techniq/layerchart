import { MathUtils, Vector3 } from 'three';

/**
 * The direction from the plot's center to the camera for `rotate` / `tilt`, as `isometric` reads
 * them: `rotate` turns the floor clockwise (seen from above) in degrees, and `tilt` tips it away
 * from the viewer, from `0` (seen from directly above) towards edge on at `90`.
 */
export function viewDirection(rotate: number, tilt: number, target = new Vector3()) {
  // Straight down leaves no "up" to orient the camera by, so stop just short of it
  const theta = MathUtils.degToRad(MathUtils.clamp(tilt, 0.01, 179.99));
  const phi = MathUtils.degToRad(rotate);
  return target.set(
    Math.sin(theta) * Math.sin(phi),
    Math.cos(theta),
    Math.sin(theta) * Math.cos(phi)
  );
}

/** The `rotate` / `tilt` a view direction (from the plot's center to the camera) is seen at */
export function viewAngles(direction: Vector3): { rotate: number; tilt: number } {
  const d = direction.clone().normalize();
  return {
    rotate: MathUtils.radToDeg(Math.atan2(d.x, d.z)),
    tilt: MathUtils.radToDeg(Math.acos(MathUtils.clamp(d.y, -1, 1))),
  };
}

/** The camera's right and up axes looking along `-direction` with `y` up */
function cameraAxes(direction: Vector3) {
  const forward = direction.clone().normalize().negate();
  const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize();
  const up = new Vector3().crossVectors(right, forward).normalize();
  return { forward, right, up };
}

/** The corners of the box from `min` to `max`, in the scene's axes (`y` up) */
function cornersOf(min: Vector3, max: Vector3) {
  const result: Vector3[] = [];
  for (const x of [min.x, max.x])
    for (const y of [min.y, max.y])
      for (const z of [min.z, max.z]) result.push(new Vector3(x, y, z));
  return result;
}

/** Each corner along the camera's right, up, and forward, from the box's middle */
function project(min: Vector3, max: Vector3, direction: Vector3) {
  const { forward, right, up } = cameraAxes(direction);
  const middle = min.clone().add(max).multiplyScalar(0.5);
  const points = cornersOf(min, max).map((corner) => {
    const offset = corner.sub(middle);
    return { across: offset.dot(right), above: offset.dot(up), deeper: offset.dot(forward) };
  });
  return { points, middle, right, up };
}

/**
 * Where a perspective camera looking along `-direction` sees the box from `min` to `max` as large
 * as it fits a `fov` (vertical, in degrees) at `aspect`, centered: what it looks at, and from how
 * far.  Seen at an angle a box's near side looks larger than its far one, so this frames what's
 * seen rather than looking at the box's middle.
 */
export function framePerspective(
  min: Vector3,
  max: Vector3,
  direction: Vector3,
  fov: number,
  aspect: number
) {
  const { points, middle, right, up } = project(min, max, direction);
  const tanV = Math.tan(MathUtils.degToRad(fov) / 2);
  const tanH = tanV * aspect;
  // From `distance` behind the middle (and moved across / up), a corner `deeper` farther away
  // is seen at `(across - x) / (distance + deeper)`, which has to be within `tan` either way.
  // Each pair of corners sets how far back the camera has to be for both to fit.
  let distance = 0;
  for (const a of points) {
    for (const b of points) {
      distance = Math.max(
        distance,
        ((a.across - b.across) / tanH - a.deeper - b.deeper) / 2,
        ((a.above - b.above) / tanV - a.deeper - b.deeper) / 2
      );
    }
  }
  // Then moved across and up until what's seen is centered: the far side looks smaller, so
  // that's not the box's middle
  const centered = (value: (p: (typeof points)[number]) => number) => {
    /** How far off center what's seen is, moved by `offset`: its two edges summed */
    const off = (offset: number) => {
      let low = Infinity;
      let high = -Infinity;
      for (const p of points) {
        const at = (value(p) - offset) / (distance + p.deeper);
        low = Math.min(low, at);
        high = Math.max(high, at);
      }
      return low + high;
    };
    // Moving one way moves every corner the other, so halve towards balanced
    let lo = Math.min(...points.map(value)) - 1;
    let hi = Math.max(...points.map(value)) + 1;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (off(mid) > 0) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };
  const target = middle
    .clone()
    .addScaledVector(
      right,
      centered((p) => p.across)
    )
    .addScaledVector(
      up,
      centered((p) => p.above)
    );
  return { target, distance };
}

/**
 * What an orthographic camera looking along `-direction` looks at, and the half width and height
 * it needs, for the box from `min` to `max` to fit at `aspect`, centered
 */
export function frameOrthographic(min: Vector3, max: Vector3, direction: Vector3, aspect: number) {
  const { points, middle, right, up } = project(min, max, direction);
  const across = points.map((p) => p.across);
  const above = points.map((p) => p.above);
  const [left, rightmost] = [Math.min(...across), Math.max(...across)];
  const [bottom, top] = [Math.min(...above), Math.max(...above)];
  let halfWidth = (rightmost - left) / 2;
  let halfHeight = (top - bottom) / 2;
  // Grow whichever side the aspect leaves short
  if (halfWidth / halfHeight > aspect) halfHeight = halfWidth / aspect;
  else halfWidth = halfHeight * aspect;
  const target = middle
    .clone()
    .addScaledVector(right, (left + rightmost) / 2)
    .addScaledVector(up, (bottom + top) / 2);
  return { target, halfWidth, halfHeight };
}
