import { getContext, setContext } from 'svelte';

/** One drawn part of a brush (its region, selection, or a handle), and the drag it takes */
export type BrushPart = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly class: string | undefined;
  readonly position: string | undefined;
  readonly onpointerdown: ((e: PointerEvent, target?: Element) => void) | undefined;
  readonly ondblclick: ((e: MouseEvent) => void) | undefined;
};

const KEY = Symbol('LayerChartWebGLBrushParts');

/** The parts a brush draws, in the order they're drawn (the last on top) */
export function setBrushParts(parts: BrushPart[]) {
  setContext(KEY, parts);
}

export function getBrushParts(): BrushPart[] | undefined {
  return getContext<BrushPart[] | undefined>(KEY);
}

/** The cursor a part shows, as the core `Brush`'s styles set it */
export function cursorOf(part: BrushPart) {
  const classes = part.class ?? '';
  if (classes.includes('lc-brush-handle')) {
    return part.position === 'top' || part.position === 'bottom' ? 'ns-resize' : 'ew-resize';
  }
  if (classes.includes('lc-brush-selection')) return 'move';
  return 'crosshair';
}
