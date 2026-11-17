import { autoFloorAspect } from '$lib/utils/floorAspect.js';
import type { MotionProp } from '$lib/utils/motion.svelte.js';

type CameraOptions = {
  /**
   * Degrees to turn the plot's floor about its centre, clockwise seen from above.  Same as
   * `isometric`'s `rotate`.
   *
   * @default -45
   */
  rotate?: number;

  /**
   * Degrees to tip the floor away from the viewer, from `0` (seen from directly above) towards
   * edge on at `90`.  Same as `isometric`'s `tilt`.
   *
   * @default 60
   */
  tilt?: number;

  /** Ease the view to new angles (and `fov`) rather than jumping, ex. `'tween'` */
  motion?: MotionProp;

  /**
   * The floor's width over its depth, kept however the chart is sized, so resizing scales the
   * whole chart rather than stretching it.  `'auto'` picks it as `isometric` does: band cells
   * square, continuous axes in equal units (unless one spans over 4× the other), else square.
   *
   * @default 'auto'
   */
  aspect?: number | 'auto';
};

export type PerspectiveOptions = CameraOptions & {
  /**
   * The camera's vertical field of view, in degrees.  Wider draws nearer things larger.
   *
   * @default 35
   */
  fov?: number;
};

export type OrthographicOptions = CameraOptions;

/** A scale and its domain, for sizing a floor `aspect: 'auto'` */
type FloorAxis = { scale: unknown; domain: unknown[] };

/**
 * The part of the plot a camera view's floor takes: `aspect` wide for its depth (`'auto'`, from
 * the `x` / `y` scales and their domains), as large as fits.  `null` lets a map's own
 * proportions (its projection's fit) stand.  Part of the camera views, so a chart without one
 * doesn't bundle it.
 */
function cameraFloor(
  options: CameraOptions,
  {
    box,
    radial,
    projected,
    x,
    y,
  }: {
    box: { width: number; height: number };
    radial: boolean;
    projected: boolean;
    x: () => FloorAxis;
    y: () => FloorAxis;
  }
) {
  const option = options.aspect ?? 'auto';
  if (option === 'auto' && projected) return null;
  const aspect = radial
    ? 1
    : typeof option === 'number'
      ? Math.max(option, 1e-6)
      : autoFloorAspect(x(), y());
  const { width, height } = box;
  if (!(width > 0 && height > 0)) return { width, height };
  return width / height > aspect
    ? { width: height * aspect, height }
    : { width, height: width / aspect };
}

/** The camera's own code a camera view brings with it, for the chart to call */
const camera = { floor: cameraFloor };
export type Camera = typeof camera;

/** A camera looking at the plot box in 3D, drawing farther things smaller */
export type PerspectiveView = {
  type: 'perspective';
  options: PerspectiveOptions;
  camera: Camera;
};

/** A camera looking at the plot box in 3D, keeping sizes true at any depth */
export type OrthographicView = {
  type: 'orthographic';
  options: OrthographicOptions;
  camera: Camera;
};

/** The angles a 3D view starts at without its own */
export const CAMERA_ANGLES = { rotate: -45, tilt: 60 };

/**
 * See the plot box in 3D through a camera, for a `Chart`'s `view`: `view={perspective}`, or
 * `view={perspective({ rotate: -30, tilt: 60, fov: 45 })}`.  Only a 3D layer (`@layerchart/webgl`)
 * draws through it; flat layers draw nothing under it, and warn.
 */
export function perspective(options: PerspectiveOptions = {}): PerspectiveView {
  return { type: 'perspective', options, camera };
}

/**
 * See the plot box in 3D with sizes kept true at any depth (as `isometric` does), for a `Chart`'s
 * `view`.  Only a 3D layer (`@layerchart/webgl`) draws through it.
 */
export function orthographic(options: OrthographicOptions = {}): OrthographicView {
  return { type: 'orthographic', options, camera };
}
