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

  /**
   * Room left around the plot box when fitting it into view, as a fraction of its size.
   *
   * @default 0.1
   */
  margin?: number;

  /** Ease the view to new angles (and `fov`) rather than jumping, ex. `'tween'` */
  motion?: MotionProp;
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

/** A camera looking at the plot box in 3D, drawing farther things smaller */
export type PerspectiveView = { type: 'perspective'; options: PerspectiveOptions };

/** A camera looking at the plot box in 3D, keeping sizes true at any depth */
export type OrthographicView = { type: 'orthographic'; options: OrthographicOptions };

/** The angles a 3D view starts at without its own */
export const CAMERA_ANGLES = { rotate: -45, tilt: 60 };

/**
 * See the plot box in 3D through a camera, for a `Chart`'s `view`: `view={perspective}`, or
 * `view={perspective({ rotate: -30, tilt: 60, fov: 45 })}`.  Only a 3D layer (`@layerchart/webgl`)
 * draws through it; flat layers draw nothing under it, and warn.
 */
export function perspective(options: PerspectiveOptions = {}): PerspectiveView {
  return { type: 'perspective', options };
}

/**
 * See the plot box in 3D with sizes kept true at any depth (as `isometric` does), for a `Chart`'s
 * `view`.  Only a 3D layer (`@layerchart/webgl`) draws through it.
 */
export function orthographic(options: OrthographicOptions = {}): OrthographicView {
  return { type: 'orthographic', options };
}
