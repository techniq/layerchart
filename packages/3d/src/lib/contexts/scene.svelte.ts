import { getContext, setContext, untrack } from 'svelte';
import { Group, Vector3, type Camera, type Intersection, type Object3D } from 'three';

import type { ColorResolver, ResolvedColor } from '../utils/color.js';

/** Which end of an axis a side of the plot box is at */
export type Side = 'min' | 'max';

/**
 * Text drawn over the scene at a point in the chart's coordinates: `x` across the plot's width
 * and `y` down its height (as the chart's scales give them), and `z` up off the floor.
 */
export type SceneLabel = {
  key: string;
  x: number;
  y: number;
  z: number;
  text: string;
  class?: string;
};

/** A mark's object the pointer can hit, and the data row each hit is on */
export type Pickable = {
  object: Object3D;
  datum: (hit: Intersection) => unknown;
};

const KEY = Symbol('LayerChart3DScene');

/**
 * What a `Scene` shares with the marks inside it.  Marks lay out in the chart's pixel
 * coordinates, as they would on a flat chart, and add their objects to `root`, which stands the
 * plot box up in the scene: chart `x` runs along three.js `x`, chart `y` along `z` (towards the
 * viewer), and height along `y` (up).
 */
export class SceneState {
  /** The group every mark adds to, its origin at the plot's `(0, 0)` corner on the floor */
  readonly root = new Group();

  /** Ask for a frame (the scene only renders on demand) */
  invalidate: () => void = () => {};

  colors: ColorResolver | null = null;
  camera: Camera | null = null;

  /** Bumped when the theme changes, so marks re-resolve their CSS colors */
  themeVersion = $state(0);

  /** Bumped whenever the camera moves, so labels re-project */
  cameraVersion = $state(0);

  /** The sides of the plot box away from the camera, for walls and axes to stand on */
  far = $state<{ x: Side; y: Side }>({ x: 'max', y: 'min' });

  /** The layer's size in CSS pixels */
  width = $state(0);
  height = $state(0);

  /**
   * Zoom the camera in (`factor` below 1) or out from where it is, easing there unless `eased` is
   * `false` (set by the scene)
   */
  zoomBy: (factor: number, eased?: boolean) => void = () => {};
  /** Back to the view the scene started with, fitted (set by the scene) */
  resetView: () => void = () => {};

  /** How many `Light`s the scene has; it lights itself until it has one */
  lights = $state(0);

  // Values, not getters: a scene unmounting off screen would otherwise read a mark's state after
  // the mark is gone
  #labels = $state.raw<SceneLabel[][]>([]);
  readonly pickables = new Set<Pickable>();
  #vector = new Vector3();

  get labelSets() {
    return this.#labels;
  }

  /**
   * Draw `labels` over the scene until the returned cleanup runs.  Call from an effect, so new
   * labels replace the old.
   */
  addLabels(labels: SceneLabel[]) {
    // Called from marks' effects, which mustn't come to depend on the list they add to
    untrack(() => (this.#labels = [...this.#labels, labels]));
    return () => {
      untrack(() => (this.#labels = this.#labels.filter((l) => l !== labels)));
    };
  }

  /** Let the pointer pick `pickable` (for tooltips) until the returned cleanup runs */
  addPickable(pickable: Pickable) {
    this.pickables.add(pickable);
    return () => {
      this.pickables.delete(pickable);
    };
  }

  /** A CSS color as three.js draws it, re-resolved when the theme changes */
  color(value: string): ResolvedColor | null {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.themeVersion;
    return this.colors?.resolve(value) ?? null;
  }

  /** A point in the scene (ex. where the pointer hit a mark) in chart coordinates */
  toChart(point: Vector3): { x: number; y: number; z: number } {
    return {
      x: point.x - this.root.position.x,
      y: point.z - this.root.position.z,
      z: point.y - this.root.position.y,
    };
  }

  /** Where a point in chart coordinates lands on the layer, in CSS pixels; `null` behind the camera */
  project(x: number, y: number, z: number): { x: number; y: number } | null {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.cameraVersion;
    const camera = this.camera;
    if (!camera || !this.width || !this.height) return null;
    const v = this.#vector.set(x, z, y).add(this.root.position).project(camera);
    if (v.z > 1) return null;
    return { x: ((v.x + 1) / 2) * this.width, y: ((1 - v.y) / 2) * this.height };
  }
}

export function setSceneContext(state: SceneState) {
  return setContext(KEY, state);
}

export function getSceneContext(): SceneState {
  const state = getContext<SceneState | undefined>(KEY);
  if (!state) {
    throw new Error('LayerChart 3D: marks from `@layerchart/3d` must be inside a `<Scene>`');
  }
  return state;
}
