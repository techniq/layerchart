import { MathUtils, Vector3 } from 'three';

/** The plot box in chart pixels: `width` × `height` on the floor, `depth` up off it */
export type PlotBox = { width: number; height: number; depth: number };

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

/** The box's eight corners about its center, in the scene's axes (`y` up) */
function corners({ width, height, depth }: PlotBox) {
  const result: Vector3[] = [];
  for (const x of [-width / 2, width / 2])
    for (const y of [-depth / 2, depth / 2])
      for (const z of [-height / 2, height / 2]) result.push(new Vector3(x, y, z));
  return result;
}

/** The camera's right and up axes looking along `-direction` with `y` up */
function cameraAxes(direction: Vector3) {
  const forward = direction.clone().normalize().negate();
  const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize();
  const up = new Vector3().crossVectors(right, forward).normalize();
  return { forward, right, up };
}

/**
 * How far from the box's center a perspective camera looking along `-direction` has to be for
 * the whole box to fit a `fov` (vertical, in degrees) at `aspect`.
 */
export function fitPerspective(box: PlotBox, direction: Vector3, fov: number, aspect: number) {
  const { forward, right, up } = cameraAxes(direction);
  const tanV = Math.tan(MathUtils.degToRad(fov) / 2);
  const tanH = tanV * aspect;
  let distance = 0;
  for (const corner of corners(box)) {
    // How much nearer the camera this corner is than the center
    const nearer = -corner.dot(forward);
    distance = Math.max(
      distance,
      nearer + Math.abs(corner.dot(right)) / tanH,
      nearer + Math.abs(corner.dot(up)) / tanV
    );
  }
  return distance;
}

/**
 * The half width and height an orthographic camera looking along `-direction` needs for the
 * whole box to fit at `aspect`.
 */
export function fitOrthographic(box: PlotBox, direction: Vector3, aspect: number) {
  const { right, up } = cameraAxes(direction);
  let halfWidth = 0;
  let halfHeight = 0;
  for (const corner of corners(box)) {
    halfWidth = Math.max(halfWidth, Math.abs(corner.dot(right)));
    halfHeight = Math.max(halfHeight, Math.abs(corner.dot(up)));
  }
  // Grow whichever side the aspect leaves short
  if (halfWidth / halfHeight > aspect) halfHeight = halfWidth / aspect;
  else halfWidth = halfHeight * aspect;
  return { halfWidth, halfHeight };
}
