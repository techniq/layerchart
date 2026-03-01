import type { MotionProp } from '$lib/utils/motion.svelte.js';
import {
  createControlledMotion,
  createMotionTracker,
  parseMotionProp,
} from '$lib/utils/motion.svelte.js';
import { localPoint } from '@layerstack/utils';
import { watch } from 'runed';
import type { ChartState } from './chart.svelte.js';

export type TransformMode = 'canvas' | 'domain' | 'manual' | 'none';
export type TransformScrollMode = 'scale' | 'translate' | 'none';

export const DEFAULT_TRANSLATE = { x: 0, y: 0 };
export const DEFAULT_SCALE = 1;

export type TransformAxis = 'x' | 'y' | 'both';

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
  initialScrollMode?: TransformScrollMode;
  clickDistance?: number;
  initialTranslate?: { x: number; y: number };
  initialScale?: number;
  onTransform?: (details: { scale: number; translate: { x: number; y: number } }) => void;
  ondragstart?: () => void;
  ondragend?: () => void;
};

export class TransformState {
  // Context reference
  ctx: ChartState | null;

  // Options
  mode: TransformMode;
  axis: TransformAxis;
  processTranslate: (
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

  // State
  pointerDown = $state(false);
  dragging = $state(false);
  scrollMode = $state<TransformScrollMode>('none');
  startPoint = $state({ x: 0, y: 0 });
  startTranslate = $state({ x: 0, y: 0 });

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
    this.processTranslate =
      options.processTranslate ??
      (this.mode === 'domain'
        ? this._createAxisConstrainedProcessTranslate()
        : (x: number, y: number, deltaX: number, deltaY: number) => ({
            x: x + deltaX,
            y: y + deltaY,
          }));
    this.disablePointer = options.disablePointer ?? false;
    this.clickDistance = options.clickDistance ?? 10;
    this.initialTranslate = options.initialTranslate ?? DEFAULT_TRANSLATE;
    this.initialScale = options.initialScale ?? DEFAULT_SCALE;
    this.onTransform = options.onTransform ?? (() => {});
    this.ondragstart = options.ondragstart ?? (() => {});
    this.ondragend = options.ondragend ?? (() => {});
    this.scrollMode = options.initialScrollMode ?? (this.mode === 'domain' ? 'scale' : 'none');

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

  private _createAxisConstrainedProcessTranslate() {
    return (x: number, y: number, deltaX: number, deltaY: number) => {
      if (this.axis === 'x') return { x: x + deltaX, y: 0 };
      if (this.axis === 'y') return { x: 0, y: y + deltaY };
      return { x: x + deltaX, y: y + deltaY };
    };
  }

  // Derived state
  get moving() {
    return this.dragging || this._translating.current || this._scaling.current;
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

    const newScale = rect
      ? this.ctx.width < this.ctx.height
        ? this.ctx.width / rect.width
        : this.ctx.height / rect.height
      : 1;

    this._translate.target = {
      x: this.ctx.width / 2 - center.x * newScale,
      y: this.ctx.height / 2 - center.y * newScale,
    };

    if (rect) {
      this._scale.target = newScale;
    }
  }

  setTranslate(
    point: { x: number; y: number },
    options?: Parameters<typeof this._translate.set>[1]
  ) {
    this._translating.handle(this._translate.set(point, options));
  }

  setScale(value: number, options?: Parameters<typeof this._scale.set>[1]) {
    this._scaling.handle(this._scale.set(value, options));
  }

  scaleTo(
    value: number,
    point: { x: number; y: number },
    options: Parameters<typeof this._scale.set>[1] | undefined = undefined
  ) {
    if (!this.ctx) return;

    const currentScale = this._scale.current;
    const newScale = this._scale.current * value;
    this.setScale(newScale, options);

    // Translate towards point (ex. mouse cursor/center) while zooming in/out
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

  onPointerDown(e: PointerEvent & { currentTarget: HTMLElement }) {
    if (this.mode === 'none' || this.disablePointer) return;

    e.preventDefault();

    this.pointerDown = true;
    this.dragging = false;
    this.startPoint = localPoint(e);
    this.startTranslate = this._translate.current;

    this.ondragstart?.();
  }

  onPointerMove(e: PointerEvent & { currentTarget: HTMLElement }) {
    if (!this.pointerDown) return;

    e.preventDefault(); // Stop text selection

    const endPoint = localPoint(e);
    const deltaX = endPoint.x - this.startPoint.x;
    const deltaY = endPoint.y - this.startPoint.y;

    if (!this.dragging) {
      // If dragged beyond threshold, disable click propagation
      this.dragging = deltaX * deltaX + deltaY * deltaY > this.clickDistance;
    }

    if (this.dragging) {
      e.stopPropagation(); // Stop tooltip from triggering (along with `capture: true`)
      e.currentTarget?.setPointerCapture(e.pointerId);

      this.setTranslate(
        this.processTranslate(this.startTranslate.x, this.startTranslate.y, deltaX, deltaY),
        this._translate.type === 'spring'
          ? { instant: true }
          : this._translate.type === 'tween'
            ? { duration: 0 }
            : undefined
      );
    }
  }

  onPointerUp(_e: PointerEvent & { currentTarget: HTMLElement }) {
    this.pointerDown = false;
    this.dragging = false;
    this.ondragend?.();
  }

  onDoubleClick(e: MouseEvent & { currentTarget: HTMLElement }) {
    if (this.mode === 'none') return;
    const point = localPoint(e);
    this.scaleTo(e.shiftKey ? 0.5 : 2, point);
  }

  onWheel(e: WheelEvent & { currentTarget: HTMLElement }) {
    if (this.mode === 'none' || this.scrollMode === 'none') return;

    e.preventDefault();

    const point = (this.startPoint = localPoint(e));

    // Pinch to zoom is registered as a wheel event with control key
    const pinchToZoom = e.ctrlKey;

    const instantMotionOptions =
      this._scale.type === 'spring'
        ? { instant: true }
        : this._scale.type === 'tween'
          ? { duration: 0 }
          : undefined;

    if (this.scrollMode === 'scale' || pinchToZoom) {
      // https://github.com/d3/d3-zoom#zoom_wheelDelta
      const scaleBy =
        -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002) * (e.ctrlKey ? 10 : 1);

      this.scaleTo(Math.pow(2, scaleBy), point, instantMotionOptions);

      // In domain mode, also handle deltaX as pan (for trackpad horizontal scroll)
      if (this.mode === 'domain' && e.deltaX !== 0) {
        const startTranslate = this._translate.current;
        this.setTranslate(
          this.processTranslate(startTranslate.x, startTranslate.y, -e.deltaX, 0),
          instantMotionOptions
        );
      }
    } else if (this.scrollMode === 'translate') {
      const startTranslate = this._translate.current;
      this._translate
        .set(
          this.processTranslate(startTranslate.x, startTranslate.y, -e.deltaX, -e.deltaY),
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
