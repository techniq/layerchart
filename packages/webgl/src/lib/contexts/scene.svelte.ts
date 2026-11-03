import { getContext, setContext, untrack } from 'svelte';
import { Group, Vector3, type Camera, type Intersection, type Object3D } from 'three';

import type { ClassStyle, ColorResolver, ResolvedColor } from '../utils/color.js';

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
  /** Hidden outside the plot box when the scene clips to it (unlike an axis's, beside it) */
  clip?: boolean;
  /** Pixels to move it across and down the screen */
  dx?: number;
  dy?: number;
  /** Which of its ends is at its point, across and down */
  textAnchor?: 'start' | 'middle' | 'end';
  verticalAnchor?: 'start' | 'middle' | 'end';
  /** Wrap onto more lines to keep within this many pixels */
  width?: number;
  /**
   * The way it sits out from its point, in the chart's axes (ex. out from an axis): it's anchored
   * by its side nearest the point, whichever way the view turns that on screen, so it keeps the
   * same gap (in place of `textAnchor` / `verticalAnchor`)
   */
  outward?: { x: number; y: number; z: number };
  /** Pixels on screen between its point and its nearest side, along `outward` */
  gap?: number;
};

/** A mark's object the pointer can hit, and the data row each hit is on */
export type Pickable = {
  object: Object3D;
  datum: (hit: Intersection) => unknown;
};

const KEY = Symbol('LayerChart3DScene');

/**
 * What a `WebGL` shares with the marks inside it.  Marks lay out in the chart's pixel
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

  /** How many `Light`s the scene has; it lights itself until it has one */
  lights = $state(0);

  /** Whether the camera has been fitted to the chart, so a frame shows it where it belongs */
  fitted = $state(false);

  /** Whether marks are clipped to the plot box (see `WebGL`'s `clip`) */
  clip = $state(false);

  /** The plot box's size, in the chart's pixels */
  plot = $state({ width: 0, height: 0 });

  /**
   * The chart pixels one pixel on screen spans at the camera's target as fitted (before any
   * zoom), to size things drawn in the scene to read at a size on screen (ex. an axis' labels)
   */
  unit = $state(1);

  /** Whether a point of the plot (`x` across, `y` down) is clipped away */
  clipped(x: number, y: number) {
    return (
      this.clip && (x < -0.5 || x > this.plot.width + 0.5 || y < -0.5 || y > this.plot.height + 0.5)
    );
  }

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
      // Not written in the teardown itself: Svelte (5.56) can lose a write made while an effect
      // tears down, leaving the new labels that replace these undrawn until something else redraws
      queueMicrotask(() => (this.#labels = this.#labels.filter((l) => l !== labels)));
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

  /**
   * What a mark's CSS `class` sets (its fill, stroke, and opacity, as LayerChart's `Canvas` layer
   * reads them), re-read when the theme changes.  `null` without one, or before the layer mounts.
   */
  style(classes: string | null | undefined): ClassStyle | null {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.themeVersion;
    return classes ? (this.colors?.style(classes) ?? null) : null;
  }

  /** A point in the scene (ex. where the pointer hit a mark) in chart coordinates */
  toChart(point: Vector3): { x: number; y: number; z: number } {
    return {
      x: point.x - this.root.position.x,
      y: point.z - this.root.position.z,
      z: point.y - this.root.position.y,
    };
  }

  /**
   * How far to shift a label with `outward` back over its point, as percents of its width and
   * height: by its side nearest the point, sliding round as the view turns
   */
  outwardShift(label: SceneLabel): { x: number; y: number; dx: number; dy: number } | null {
    const outward = label.outward;
    if (!outward) return null;
    const from = this.project(label.x, label.y, label.z);
    const to = this.project(label.x + outward.x, label.y + outward.y, label.z + outward.z);
    if (!from || !to) return null;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);
    if (!length) return { x: -50, y: -50, dx: 0, dy: 0 };
    // Pointing right, its left side is at the point (0%); left, its right (-100%); between, between
    const along = (d: number) => -50 + 50 * Math.max(-1, Math.min(1, (d / length) * 1.4));
    const gap = label.gap ?? 0;
    return { x: along(dx), y: along(dy), dx: (dx / length) * gap, dy: (dy / length) * gap };
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

const UNCLIPPED = Symbol('LayerChartWebGLUnclipped');

/** Keep what marks inside draw from being clipped to the plot box (ex. an axis' labels beside it) */
export function setUnclipped() {
  setContext(UNCLIPPED, true);
}

/** Whether marks here are kept from being clipped to the plot box (see `setUnclipped`) */
export function isUnclipped() {
  return getContext<boolean>(UNCLIPPED) ?? false;
}

export function setSceneContext(state: SceneState) {
  return setContext(KEY, state);
}

export function getSceneContext(): SceneState {
  const state = getContext<SceneState | undefined>(KEY);
  if (!state) {
    throw new Error('LayerChart 3D: marks from `@layerchart/webgl` must be inside a `<WebGL>`');
  }
  return state;
}
