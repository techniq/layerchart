import type { MotionProp } from '$lib/utils/motion.svelte.js';
import {
  createControlledMotion,
  createMotionTracker,
  parseMotionProp,
} from '$lib/utils/motion.svelte.js';
import { localPoint } from '@layerstack/utils';
import { watch } from 'runed';
import type { ChartState } from './chart.svelte.js';

export type TransformMode = 'canvas' | 'domain' | 'projection' | 'none';
export type TransformScrollMode = 'scale' | 'translate' | 'none';
export type ScrollActivationKey = 'meta' | 'alt' | 'control' | 'shift';

export const DEFAULT_TRANSLATE = { x: 0, y: 0 };
export const DEFAULT_SCALE = 1;

export type TransformAxis = 'x' | 'y' | 'both';

export type TransformConstraint = {
  scale: number;
  translate: { x: number; y: number };
};

export type InertiaOptions = {
  /** Decay factor controlling how far inertia carries. Higher = further. Default: 0.99 */
  decay?: number;
  /** Minimum velocity (px/ms) to trigger inertia. Default: 0.1 */
  minVelocity?: number;
  /** Maximum velocity (px/ms) to cap inertia. Prevents wild throws. Default: Infinity (no cap) */
  maxVelocity?: number;
  /** Time window (ms) to measure velocity from recent pointer movement. Default: 160 */
  velocityWindow?: number;
};

export type TransformStateOptions = {
  mode?: TransformMode;
  axis?: TransformAxis;
  motion?: MotionProp;
  processTranslate?: (
    x: number,
    y: number,
    deltaX: number,
    deltaY: number
  ) => { x: number; y: number };
  disablePointer?: boolean;
  scrollMode?: TransformScrollMode;
  clickDistance?: number;
  initialTranslate?: { x: number; y: number };
  initialScale?: number;
  onTransform?: (details: { scale: number; translate: { x: number; y: number } }) => void;
  ondragstart?: () => void;
  ondragend?: () => void;

  /** Enable inertia (momentum) after drag release. Pass `true` for defaults or an options object. */
  inertia?: boolean | InertiaOptions;

  /**
   * Enable two-finger pinch-to-zoom (and simultaneous pan) on touch devices.
   * Trackpad pinch (wheel + ctrl) is always supported when `scrollMode` is not `none`.
   * Default: `true`
   */
  pinch?: boolean;

  /** Require a modifier key to be held for scroll/wheel to activate zoom/pan. Default: no key required. */
  scrollActivationKey?: ScrollActivationKey;

  /** Min/max scale factor [minScale, maxScale]. Default: no limit. */
  scaleExtent?: [number, number];

  /** Translate bounds [[minX, minY], [maxX, maxY]]. Default: no limit. */
  translateExtent?: [[number, number], [number, number]];

  /**
   * Custom constraint function called after every transform update.
   * Return corrected scale/translate values.
   * Called after scaleExtent and translateExtent are applied.
   */
  constrain?: (transform: TransformConstraint) => TransformConstraint;
};

export class TransformState {
  // Context reference
  ctx: ChartState | null;

  // Options
  mode: TransformMode;
  axis: TransformAxis;
  processTranslate?: (
    x: number,
    y: number,
    deltaX: number,
    deltaY: number
  ) => {
    x: number;
    y: number;
  };
  disablePointer: boolean;
  clickDistance: number;
  initialTranslate: { x: number; y: number };
  initialScale: number;
  onTransform: (details: { scale: number; translate: { x: number; y: number } }) => void;
  ondragstart: () => void;
  ondragend: () => void;
  scrollActivationKey: ScrollActivationKey | undefined;
  scaleExtent: [number, number] | undefined;
  translateExtent: [[number, number], [number, number]] | undefined;
  constrain: ((transform: TransformConstraint) => TransformConstraint) | undefined;
  inertia: {
    enabled: boolean;
    decay: number;
    minVelocity: number;
    maxVelocity: number;
    velocityWindow: number;
  };
  pinch: boolean;

  // State
  pointerDown = $state(false);
  dragging = $state(false);
  pinching = $state(false);
  scrollMode = $state<TransformScrollMode>('none');
  startPoint = $state({ x: 0, y: 0 });
  startTranslate = $state({ x: 0, y: 0 });

  // Velocity tracking for inertia
  private _pointerSamples: { x: number; y: number; t: number }[] = [];

  // Active pointers (by `pointerId`), used to detect multi-touch pinch gestures
  private _pointers = new Map<number, { x: number; y: number }>();

  // Gesture reference captured when a pinch begins (null when not pinching)
  private _pinchStart: {
    distance: number;
    midpoint: { x: number; y: number };
    scale: number;
    translate: { x: number; y: number };
  } | null = null;

  // Motion controllers (internal)
  private _translate: ReturnType<typeof createControlledMotion<{ x: number; y: number }>>;
  private _scale: ReturnType<typeof createControlledMotion<number>>;
  private _translating: ReturnType<typeof createMotionTracker>;
  private _scaling: ReturnType<typeof createMotionTracker>;

  constructor(ctx: ChartState | null, options: TransformStateOptions = {}) {
    this.ctx = ctx;

    // Initialize options with defaults
    this.mode = options.mode ?? 'none';
    this.axis = options.axis ?? 'both';
    this.processTranslate = options.processTranslate;
    this.disablePointer = options.disablePointer ?? false;
    this.clickDistance = options.clickDistance ?? 10;
    this.initialTranslate = options.initialTranslate ?? DEFAULT_TRANSLATE;
    this.initialScale = options.initialScale ?? DEFAULT_SCALE;
    this.onTransform = options.onTransform ?? (() => {});
    this.ondragstart = options.ondragstart ?? (() => {});
    this.ondragend = options.ondragend ?? (() => {});
    this.scrollActivationKey = options.scrollActivationKey;
    this.scaleExtent = options.scaleExtent;
    this.translateExtent = options.translateExtent;
    this.constrain = options.constrain;
    this.pinch = options.pinch ?? true;

    // Inertia
    const inertiaOpt = options.inertia;
    if (inertiaOpt === true) {
      this.inertia = {
        enabled: true,
        decay: 0.99,
        minVelocity: 0.1,
        maxVelocity: Infinity,
        velocityWindow: 160,
      };
    } else if (typeof inertiaOpt === 'object') {
      this.inertia = {
        enabled: true,
        decay: inertiaOpt.decay ?? 0.99,
        minVelocity: inertiaOpt.minVelocity ?? 0.1,
        maxVelocity: inertiaOpt.maxVelocity ?? Infinity,
        velocityWindow: inertiaOpt.velocityWindow ?? 160,
      };
    } else {
      this.inertia = {
        enabled: false,
        decay: 0.99,
        minVelocity: 0.1,
        maxVelocity: Infinity,
        velocityWindow: 160,
      };
    }
    this.scrollMode = options.scrollMode ?? (this.mode === 'domain' ? 'scale' : 'none');

    // Initialize motion controllers
    const resolvedMotion = parseMotionProp(options.motion);
    this._translate = createControlledMotion(this.initialTranslate, resolvedMotion);
    this._scale = createControlledMotion(this.initialScale, resolvedMotion);
    this._translating = createMotionTracker();
    this._scaling = createMotionTracker();

    // Watch for transform changes
    watch([() => this._scale.current, () => this._translate.current], () => {
      this.onTransform({
        scale: this._scale.current,
        translate: this._translate.current,
      });
    });
  }

  private _applyTranslate(x: number, y: number, deltaX: number, deltaY: number) {
    if (this.processTranslate) return this.processTranslate(x, y, deltaX, deltaY);
    if (this.mode === 'domain') {
      // Negate deltaY because screen Y (top→bottom) is inverted vs data Y (bottom→top).
      // This works for both normal and reversed Y domains because _computeTransformDomain
      // uses signed range, which naturally handles the reversal.
      if (this.axis === 'x') return { x: x + deltaX, y: 0 };
      if (this.axis === 'y') return { x: 0, y: y - deltaY };
      return { x: x + deltaX, y: y - deltaY };
    }
    return { x: x + deltaX, y: y + deltaY };
  }

  /** Clamp scale and translate using scaleExtent, translateExtent, and custom constrain. */
  private _clampScale(value: number): number {
    if (this.scaleExtent) {
      value = Math.max(this.scaleExtent[0], Math.min(this.scaleExtent[1], value));
    }
    return value;
  }

  private _clampTranslate(point: { x: number; y: number }): { x: number; y: number } {
    let { x, y } = point;
    if (this.translateExtent) {
      const [[minX, minY], [maxX, maxY]] = this.translateExtent;
      x = Math.max(minX, Math.min(maxX, x));
      y = Math.max(minY, Math.min(maxY, y));
    }
    return { x, y };
  }

  private _applyConstraints(
    scale: number,
    translate: { x: number; y: number }
  ): { scale: number; translate: { x: number; y: number } } {
    scale = this._clampScale(scale);
    translate = this._clampTranslate(translate);
    if (this.constrain) {
      const constrained = this.constrain({ scale, translate });
      scale = constrained.scale;
      translate = constrained.translate;
    }
    return { scale, translate };
  }

  /**
   * Motion options which apply the change immediately (used while following a pointer/wheel gesture)
   */
  private _instantMotion(motion: { type: string }) {
    return motion.type === 'spring'
      ? { instant: true }
      : motion.type === 'tween'
        ? { duration: 0 }
        : undefined;
  }

  /**
   * In domain mode, reflect the Y coordinate since screen Y is inverted vs data Y.  This ensures
   * zooming targets the correct data position under the cursor/gesture.
   */
  private _reflectPoint(point: { x: number; y: number }) {
    if (!this.ctx || this.mode !== 'domain' || this.axis === 'x') return point;
    return {
      x: point.x,
      y: this.ctx.padding.top + this.ctx.height - (point.y - this.ctx.padding.top),
    };
  }

  // Derived state
  get moving() {
    return this.dragging || this.pinching || this._translating.current || this._scaling.current;
  }

  /**
   * Where the transform is settling, rather than where it is.
   *
   * `scale` / `translate` follow the animation, which is what rendering wants — but anything
   * *sharing* the position wants the value it will come to rest at, or it shares every frame the
   * animation passes through.
   */
  get targetScale() {
    return this._scale.target;
  }

  get targetTranslate() {
    return this._translate.target;
  }

  // Public getters and setters for scale and translate
  get scale() {
    return this._scale.current;
  }

  set scale(value: number) {
    this.setScale(value);
  }

  get translate() {
    return this._translate.current;
  }

  set translate(point: { x: number; y: number }) {
    this.setTranslate(point);
  }

  setScrollMode(mode: TransformScrollMode) {
    this.scrollMode = mode;
  }

  reset() {
    this._translate.target = this.initialTranslate;
    this._scale.target = this.initialScale;
  }

  zoomIn() {
    if (!this.ctx) return;
    this.scaleTo(1.25, {
      x: (this.ctx.width + this.ctx.padding.left) / 2,
      y: (this.ctx.height + this.ctx.padding.top) / 2,
    });
  }

  zoomOut() {
    if (!this.ctx) return;
    this.scaleTo(0.8, {
      x: (this.ctx.width + this.ctx.padding.left) / 2,
      y: (this.ctx.height + this.ctx.padding.top) / 2,
    });
  }

  translateCenter() {
    this._translate.target = { x: 0, y: 0 };
  }

  zoomTo(center: { x: number; y: number }, rect?: { width: number; height: number }) {
    if (!this.ctx) return;

    let newScale = rect
      ? this.ctx.width < this.ctx.height
        ? this.ctx.width / rect.width
        : this.ctx.height / rect.height
      : 1;

    newScale = this._clampScale(newScale);

    const newTranslate = {
      x: this.ctx.width / 2 - center.x * newScale,
      y: this.ctx.height / 2 - center.y * newScale,
    };

    const constrained = this._applyConstraints(newScale, newTranslate);

    this._translate.target = constrained.translate;

    if (rect) {
      this._scale.target = constrained.scale;
    }
  }

  setTranslate(
    point: { x: number; y: number },
    options?: Parameters<typeof this._translate.set>[1]
  ) {
    const constrained = this._applyConstraints(this._scale.current, point);
    this._translating.handle(this._translate.set(constrained.translate, options));
  }

  setScale(value: number, options?: Parameters<typeof this._scale.set>[1]) {
    const clamped = this._clampScale(value);
    this._scaling.handle(this._scale.set(clamped, options));
  }

  scaleTo(
    value: number,
    point: { x: number; y: number },
    options: Parameters<typeof this._scale.set>[1] | undefined = undefined
  ) {
    if (!this.ctx) return;

    point = this._reflectPoint(point);

    const currentScale = this._scale.current;
    const newScale = this._clampScale(this._scale.current * value);
    this.setScale(newScale, options);

    // Translate towards point (ex. mouse cursor/center) while zooming in/out
    if (!this.processTranslate) {
      const invertTransformPoint = {
        x: (point.x - this.ctx.padding.left - this._translate.current.x) / currentScale,
        y: (point.y - this.ctx.padding.top - this._translate.current.y) / currentScale,
      };
      const newTranslate = {
        x: point.x - this.ctx.padding.left - invertTransformPoint.x * newScale,
        y: point.y - this.ctx.padding.top - invertTransformPoint.y * newScale,
      };

      // Constrain translate to active axis in domain mode
      if (this.mode === 'domain') {
        if (this.axis === 'x') newTranslate.y = 0;
        if (this.axis === 'y') newTranslate.x = 0;
      }

      this.setTranslate(newTranslate, options);
    }
  }

  /** Continue receiving events for a pointer after it leaves the element */
  private _capturePointer(e: PointerEvent & { currentTarget: HTMLElement }) {
    try {
      e.currentTarget?.setPointerCapture(e.pointerId);
    } catch {
      // Pointer is no longer active
    }
  }

  /** The two oldest active pointers, if a pinch gesture is possible */
  private _pinchPoints() {
    if (this._pointers.size < 2) return null;
    const [a, b] = [...this._pointers.values()];
    return [a, b] as const;
  }

  /** Distance between pinch pointers, restricted to the active axis in domain mode */
  private _pinchDistance(a: { x: number; y: number }, b: { x: number; y: number }) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (this.mode === 'domain') {
      if (this.axis === 'x') return Math.abs(dx);
      if (this.axis === 'y') return Math.abs(dy);
    }
    return Math.hypot(dx, dy);
  }

  /** Capture the current scale/translate as the reference for the (re)starting pinch gesture */
  private _startPinch() {
    const points = this._pinchPoints();
    if (!points) return;

    const distance = this._pinchDistance(points[0], points[1]);
    if (distance === 0) return;

    this._pinchStart = {
      distance,
      midpoint: {
        x: (points[0].x + points[1].x) / 2,
        y: (points[0].y + points[1].y) / 2,
      },
      scale: this._scale.current,
      translate: this._translate.current,
    };
    this.pinching = true;
    this.pointerDown = true;
    // Suppress click/tooltip while pinching (same as dragging)
    this.dragging = true;
    // Do not carry pointer movement from before the pinch into inertia
    this._pointerSamples = [];
  }

  private _endPinch() {
    this._pinchStart = null;
    this.pinching = false;
  }

  private _updatePinch() {
    const pinchStart = this._pinchStart;
    const points = this._pinchPoints();
    if (!pinchStart || !points || !this.ctx) return;

    const distance = this._pinchDistance(points[0], points[1]);
    if (distance === 0) return;

    const midpoint = {
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2,
    };

    const newScale = this._clampScale(pinchStart.scale * (distance / pinchStart.distance));
    this.setScale(newScale, this._instantMotion(this._scale));

    const translateMotion = this._instantMotion(this._translate);

    if (this.processTranslate) {
      // Translate is not in screen space (ex. globe rotation) - pan by the midpoint delta, same as dragging
      this.setTranslate(
        this._applyTranslate(
          pinchStart.translate.x,
          pinchStart.translate.y,
          midpoint.x - pinchStart.midpoint.x,
          midpoint.y - pinchStart.midpoint.y
        ),
        translateMotion
      );
    } else {
      // Keep the content under the initial midpoint anchored to the current midpoint, which
      // handles zooming and two-finger panning together
      const startMidpoint = this._reflectPoint(pinchStart.midpoint);
      const currentMidpoint = this._reflectPoint(midpoint);

      const invertTransformPoint = {
        x: (startMidpoint.x - this.ctx.padding.left - pinchStart.translate.x) / pinchStart.scale,
        y: (startMidpoint.y - this.ctx.padding.top - pinchStart.translate.y) / pinchStart.scale,
      };
      const newTranslate = {
        x: currentMidpoint.x - this.ctx.padding.left - invertTransformPoint.x * newScale,
        y: currentMidpoint.y - this.ctx.padding.top - invertTransformPoint.y * newScale,
      };

      // Constrain translate to active axis in domain mode
      if (this.mode === 'domain') {
        if (this.axis === 'x') newTranslate.y = 0;
        if (this.axis === 'y') newTranslate.x = 0;
      }

      this.setTranslate(newTranslate, translateMotion);
    }
  }

  onPointerDown(e: PointerEvent & { currentTarget: HTMLElement }) {
    if (this.mode === 'none' || this.disablePointer) return;

    e.preventDefault();

    this._pointers.set(e.pointerId, localPoint(e));

    if (this.pinch && this._pointers.size >= 2) {
      // Additional pointer - transition from dragging (or a previous pinch) to a new pinch gesture
      this._startPinch();
      return;
    }

    this.pointerDown = true;
    this.dragging = false;
    this.startPoint = localPoint(e);
    this.startTranslate = this._translate.current;
    this._pointerSamples = [];

    this.ondragstart?.();
  }

  onPointerMove(e: PointerEvent & { currentTarget: HTMLElement }) {
    const endPoint = this._pointers.has(e.pointerId) ? localPoint(e) : null;
    if (endPoint) this._pointers.set(e.pointerId, endPoint);

    if (this.pinch && !this._pinchStart && this._pointers.size >= 2) {
      // Pointers started at the same location (zero distance) - anchor the pinch once they separate
      this._startPinch();
    }

    if (this._pinchStart) {
      e.preventDefault();
      e.stopPropagation(); // Stop tooltip from triggering (along with `capture: true`)
      // Keep receiving moves for both pointers, even if one leaves the element
      this._capturePointer(e);
      this._updatePinch();
      return;
    }

    if (!this.pointerDown || !endPoint) return;

    e.preventDefault(); // Stop text selection

    const deltaX = endPoint.x - this.startPoint.x;
    const deltaY = endPoint.y - this.startPoint.y;

    if (!this.dragging) {
      // If dragged beyond threshold, disable click propagation
      this.dragging = deltaX * deltaX + deltaY * deltaY > this.clickDistance;
    }

    if (this.dragging) {
      e.stopPropagation(); // Stop tooltip from triggering (along with `capture: true`)
      this._capturePointer(e);

      // Track pointer samples for inertia velocity calculation
      if (this.inertia.enabled) {
        const now = performance.now();
        this._pointerSamples.push({ x: endPoint.x, y: endPoint.y, t: now });
        // Trim to keep only samples within the velocity window (plus some buffer)
        const windowStart = now - this.inertia.velocityWindow * 2;
        while (this._pointerSamples.length > 2 && this._pointerSamples[0].t < windowStart) {
          this._pointerSamples.shift();
        }
      }

      this.setTranslate(
        this._applyTranslate(this.startTranslate.x, this.startTranslate.y, deltaX, deltaY),
        this._instantMotion(this._translate)
      );
    }
  }

  onPointerUp(e: PointerEvent & { currentTarget: HTMLElement }) {
    this._pointers.delete(e.pointerId);

    if (this._pinchStart) {
      if (this._pointers.size >= 2) {
        // Still enough pointers to pinch - re-anchor to the remaining pointers
        this._startPinch();
        return;
      }

      this._endPinch();

      const remaining = [...this._pointers.values()][0];
      if (remaining) {
        // Continue dragging with the remaining pointer without jumping
        this.startPoint = remaining;
        this.startTranslate = this._translate.current;
        this._pointerSamples = [];
        return;
      }

      // Pinch ended without inertia (velocity samples are not tracked while pinching)
      this.pointerDown = false;
      this.dragging = false;
      this.ondragend?.();
      return;
    }

    const wasDragging = this.dragging;
    this.pointerDown = false;
    this.dragging = false;

    // Apply inertia if enabled and was dragging with enough velocity
    if (this.inertia.enabled && wasDragging && this._pointerSamples.length >= 2) {
      const now = performance.now();
      // Filter samples to the velocity measurement window
      const windowStart = now - this.inertia.velocityWindow;
      const recentSamples = this._pointerSamples.filter((s) => s.t >= windowStart);

      if (recentSamples.length >= 2) {
        // Compute velocity using recency-weighted per-segment approach.
        // More recent segments get higher weight, so the final gesture
        // direction/speed dominates over earlier movement in the window.
        let weightedVx = 0;
        let weightedVy = 0;
        let totalWeight = 0;

        for (let i = 1; i < recentSamples.length; i++) {
          const prev = recentSamples[i - 1];
          const curr = recentSamples[i];
          const segDt = curr.t - prev.t;
          if (segDt <= 0) continue;

          const segVx = (curr.x - prev.x) / segDt;
          const segVy = (curr.y - prev.y) / segDt;

          // Quadratic recency weight: recent segments contribute more
          const recency = (curr.t - windowStart) / this.inertia.velocityWindow;
          const weight = recency * recency;

          weightedVx += segVx * weight;
          weightedVy += segVy * weight;
          totalWeight += weight;
        }

        if (totalWeight > 0) {
          let vx = weightedVx / totalWeight;
          let vy = weightedVy / totalWeight;
          let speed = Math.sqrt(vx * vx + vy * vy);

          // Cap velocity to prevent wild throws
          if (speed > this.inertia.maxVelocity) {
            const ratio = this.inertia.maxVelocity / speed;
            vx *= ratio;
            vy *= ratio;
            speed = this.inertia.maxVelocity;
          }

          if (speed > this.inertia.minVelocity) {
            // Project target: velocity * decay multiplier (converts decay 0-1 to a distance factor)
            // With decay=0.99, factor = 100, giving a natural coast distance
            const factor = 1 / (1 - this.inertia.decay);
            const current = this._translate.current;
            const projectedX = current.x + vx * factor;
            const projectedY = current.y + vy * factor;

            // For tween motion, compute coast duration proportional to velocity.
            // Faster flings coast longer (similar to MapLibre/Google Maps behavior).
            const motionOptions =
              this._translate.type === 'tween'
                ? { duration: Math.min(speed * 500, 1200) }
                : undefined;

            this.setTranslate(
              this._applyTranslate(
                current.x,
                current.y,
                projectedX - current.x,
                projectedY - current.y
              ),
              motionOptions
            );
          }
        }
      }
      this._pointerSamples = [];
    }

    this.ondragend?.();
  }

  /**
   * Release a cancelled pointer (ex. touch interrupted by the browser).  Without this, stale
   * pointers would remain active and be treated as part of a subsequent pinch gesture.
   */
  onPointerCancel(e: PointerEvent & { currentTarget: HTMLElement }) {
    this._pointers.delete(e.pointerId);

    if (this._pinchStart) {
      if (this._pointers.size >= 2) {
        this._startPinch();
        return;
      }
      this._endPinch();
    }

    const remaining = [...this._pointers.values()][0];
    if (remaining) {
      // Continue dragging with the remaining pointer without jumping
      this.startPoint = remaining;
      this.startTranslate = this._translate.current;
      this._pointerSamples = [];
      return;
    }

    if (!this.pointerDown) return;

    this.pointerDown = false;
    this.dragging = false;
    this._pointerSamples = [];
    this.ondragend?.();
  }

  onDoubleClick(e: MouseEvent & { currentTarget: HTMLElement }) {
    if (this.mode === 'none') return;
    const point = localPoint(e);
    this.scaleTo(e.shiftKey ? 0.5 : 2, point);
  }

  private _isActivationKeyHeld(e: WheelEvent): boolean {
    if (!this.scrollActivationKey) return true;
    switch (this.scrollActivationKey) {
      case 'meta':
        return e.metaKey;
      case 'alt':
        return e.altKey;
      case 'control':
        return e.ctrlKey;
      case 'shift':
        return e.shiftKey;
    }
  }

  onWheel(e: WheelEvent & { currentTarget: HTMLElement }) {
    if (this.mode === 'none' || this.scrollMode === 'none') return;
    if (!this._isActivationKeyHeld(e)) return;

    e.preventDefault();

    const point = (this.startPoint = localPoint(e));

    // Pinch to zoom is registered as a wheel event with control key
    const pinchToZoom = e.ctrlKey;

    const instantMotionOptions = this._instantMotion(this._scale);

    if (this.scrollMode === 'scale' || pinchToZoom) {
      // https://github.com/d3/d3-zoom#zoom_wheelDelta
      const scaleBy =
        -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002) * (e.ctrlKey ? 10 : 1);

      this.scaleTo(Math.pow(2, scaleBy), point, instantMotionOptions);

      // In domain mode, also handle deltaX as pan (for trackpad horizontal scroll)
      if (this.mode === 'domain' && e.deltaX !== 0) {
        const startTranslate = this._translate.current;
        this.setTranslate(
          this._applyTranslate(startTranslate.x, startTranslate.y, -e.deltaX, 0),
          instantMotionOptions
        );
      }
    } else if (this.scrollMode === 'translate') {
      const startTranslate = this._translate.current;
      this._translate
        .set(
          this._applyTranslate(startTranslate.x, startTranslate.y, -e.deltaX, -e.deltaY),
          instantMotionOptions
        )
        .then(() => {})
        .catch(() => {});
    }
  }
}

export function createDefaultTransformState() {
  return new TransformState(null, {
    mode: 'none',
    initialTranslate: DEFAULT_TRANSLATE,
    initialScale: DEFAULT_SCALE,
  });
}
