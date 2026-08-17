import type { BrushState } from '$lib/states/brush.svelte.js';
import { scaleInvert, type AnyScale } from '$lib/utils/scales.svelte.js';

/** What a drag does to the selection */
export type BrushMode = 'create' | 'move' | 'top' | 'bottom' | 'left' | 'right';

export type BrushableOptions = {
  /** The selection this gesture drives.  Each element gets its own. */
  state: BrushState;

  /** The axis the drag reads.  Defaults to the state's own `axis`. */
  axis?: 'x' | 'y' | 'both';

  /**
   * Force what the drag does, rather than picking by where it starts.
   *
   * Set this on an element that *is* one part of the brush — a resize handle takes its own edge —
   * leaving the automatic behaviour to a single element covering the whole region.
   */
  mode?: BrushMode;

  /**
   * The element defining the coordinate space, when it isn't the one being dragged.
   *
   * A brush's selection and handles are small elements *within* the brushable region, so they
   * measure against the region rather than themselves.  Given the dragged element, for the cases
   * that can only resolve the space once the drag starts — a canvas layer knows its element only
   * from the event.
   */
  bounds?: (node: Element) => { left: number; top: number } | undefined;

  /**
   * The pixel origin values are measured from, given the pointer's offset within the element.
   * Defaults to the element's own box; return `null` to ignore the gesture.
   *
   * A faceted chart uses this to measure from the panel the drag started in.
   */
  origin?: (offset: { x: number; y: number }) => { x: number; y: number } | null;

  /** Distance from an edge, in pixels, that resizes rather than starting a new selection @default 6 */
  edgeSize?: number;

  /** A drag shorter than this, in pixels, clears the selection instead @default 2 */
  clearThreshold?: number;

  /** Called as the selection changes, and once more when the gesture ends */
  onChange?: (detail: { state: BrushState; phase: 'start' | 'brush' | 'end' }) => void;
};

/**
 * Makes an element brushable, driving the `BrushState` it's given.
 *
 * A chart's `brush` prop covers the plot area and owns one selection.  This is the same gesture —
 * drag to select, drag the middle to move it, drag an edge to resize, click to clear — attached to
 * an element you place yourself, so a chart can carry several independent selections: one per axis
 * of a parallel coordinates plot, say.
 *
 * The element's box *is* the brushable region (`d3-brush` calls this the `extent`), and is assumed
 * to line up with the plot area on the brushed axis — which is what a full-height axis overlay does.
 *
 * ```svelte
 * <rect width={24} height={context.height} {@attach brushable({ state: brushes.get(key) })} />
 * ```
 */
export function brushable(options: BrushableOptions) {
  const onPointerDown = brushGesture(options);

  return (node: SVGElement | HTMLElement) => {
    const handler = (event: PointerEvent) => onPointerDown(event, node);
    node.addEventListener('pointerdown', handler as EventListener);
    return () => node.removeEventListener('pointerdown', handler as EventListener);
  };
}

/**
 * The brush gesture as a `pointerdown` handler, for where an attachment can't reach.
 *
 * A canvas layer draws its marks rather than creating elements for them, so it hit-tests the
 * pointer and calls the handler the mark registered — there's no node to attach to.  Prefer
 * {@link brushable} anywhere there is one.
 */
export function brushGesture(options: BrushableOptions) {
  return function onPointerDown(event: PointerEvent, target?: Element) {
    // A brush's parts nest — the selection and its handles sit inside the region that creates a
    // new one — so the innermost takes the drag rather than every ancestor also claiming it
    event.stopPropagation();

    const node = target ?? (event.currentTarget as Element);
    if (!node) return;

    const { state, edgeSize = 6, clearThreshold = 2, onChange } = options;
    const axis = options.axis ?? state.axis;
    const ctx = state.ctx;
    if (!ctx) return;

    const bounds = options.bounds?.(node) ?? node.getBoundingClientRect();
    const offset = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };

    const origin = options.origin ? options.origin(offset) : { x: 0, y: 0 };
    if (!origin) return;

    /** The pointer as a value on each brushed axis */
    // `BrushChartContext` types its scales as callables; `scaleInvert` wants the full scale,
    // which is what a chart always passes
    const valueAt = (e: { clientX: number; clientY: number }) => ({
      x: scaleInvert(ctx.xScale as AnyScale, e.clientX - bounds.left - origin.x),
      y: scaleInvert(ctx.yScale as AnyScale, e.clientY - bounds.top - origin.y),
    });

    // Where the drag starts decides what it does, as `d3-brush` does: an edge resizes, the
    // middle moves the selection, and anywhere else starts a new one
    const range = state.range;
    const near = (a: number, b: number) => Math.abs(a - b) < edgeSize;

    let mode: BrushMode = options.mode ?? 'create';
    if (!options.mode && state.active) {
      const insideY = offset.y > range.y && offset.y < range.y + range.height;
      const insideX = offset.x > range.x && offset.x < range.x + range.width;

      if (axis !== 'x' && near(offset.y, range.y)) mode = 'top';
      else if (axis !== 'x' && near(offset.y, range.y + range.height)) mode = 'bottom';
      else if (axis !== 'y' && near(offset.x, range.x)) mode = 'left';
      else if (axis !== 'y' && near(offset.x, range.x + range.width)) mode = 'right';
      else if (insideX && insideY) mode = 'move';
    }

    const start = {
      x: [state.x[0] ?? state.xDomainMin, state.x[1] ?? state.xDomainMax] as [any, any],
      y: [state.y[0] ?? state.yDomainMin, state.y[1] ?? state.yDomainMax] as [any, any],
      value: valueAt(event),
    };

    // Best effort — a synthesized event has no active pointer to capture, and the window
    // listeners below carry the drag either way (including past the element's own bounds)
    try {
      node.setPointerCapture(event.pointerId);
    } catch {
      // ignore
    }
    onChange?.({ state, phase: 'start' });

    /**
     * Whether this gesture is a drag rather than a click.
     *
     * Tracked as "moved at all", not as the distance between press and release — dragging a
     * selection away and back again is still a drag, and must not clear it.
     */
    let dragged = false;

    function onPointerMove(e: PointerEvent) {
      if (Math.hypot(e.clientX - event.clientX, e.clientY - event.clientY) >= clearThreshold) {
        dragged = true;
      }

      const value = valueAt(e);
      if (mode === 'create') state.setRange(start.value, value);
      else if (mode === 'move') state.moveRange(start, value);
      else state.adjustEdge(mode, start, value);

      onChange?.({ state, phase: 'brush' });
    }

    function onPointerUp() {
      // Clicking the region rather than dragging it clears the selection.  Only the region — a
      // click that lands on the selection or a handle is a grab the pointer never followed
      // through on, and throwing the selection away for it would be its own surprise.
      if (clearThreshold > 0 && !dragged && mode === 'create') {
        state.reset();
        // Clearing *is* a change, and a click produces no `pointermove` to report one — so say so
        // here, or a listener watching the selection would never hear that it emptied
        onChange?.({ state, phase: 'brush' });
      }

      window.removeEventListener('pointermove', onPointerMove as EventListener);
      onChange?.({ state, phase: 'end' });
    }

    window.addEventListener('pointermove', onPointerMove as EventListener);
    window.addEventListener('pointerup', onPointerUp, { once: true });
  };
}
