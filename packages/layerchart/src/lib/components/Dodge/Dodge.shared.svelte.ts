import type { Snippet } from 'svelte';

/**
 * Minimal interval tracker matching the subset of `interval-tree-1d`'s API
 * used by the dodge algorithm (the same package Observable Plot and SveltePlot
 * use). Inlined as a linear scan instead of a real tree because:
 *
 *  - For typical dodge use cases (n < ~1000) linear scan beats a real tree
 *    on wall time due to lower constants — the tree only wins for very large
 *    datasets.
 *  - Avoids a CJS-only dep that requires `ssr.external` config in some Vite
 *    setups (e.g. `noExternal: true` deploys).
 *
 * The API mirrors `interval-tree-1d` (`insert` + `queryInterval`), so swap
 * to a real tree if profiling ever shows it matters.
 */
function createIntervalTree() {
  const items: Array<[number, number, number]> = [];
  return {
    insert(interval: [number, number, number]) {
      items.push(interval);
    },
    queryInterval(lo: number, hi: number, visit: (interval: [number, number, number]) => void) {
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it[0] <= hi && it[1] >= lo) visit(it);
      }
    },
  };
}

export type DodgeAnchor = 'top' | 'middle' | 'bottom' | 'left' | 'right';

export type DodgeItem<T> = {
  data: T;
  /** Pixel position along the x-axis. */
  x: number;
  /** Pixel position along the y-axis. */
  y: number;
  /** Resolved radius used for collision detection. */
  r: number;
  /** Original index of the datum in the input `data` array. */
  index: number;
};

export type DodgePropsWithoutHTML<T = any> = {
  /** Data to dodge. Falls back to chart context data when omitted. */
  data?: T[];
  /**
   * Axis to dodge along (the axis whose value is computed; the other axis is the anchor).
   * @default 'y'
   */
  axis?: 'x' | 'y';
  /**
   * Anchor edge along the dodge axis.
   *   - `axis='y'`: `'top'` (stack down), `'middle'` (stack from center), `'bottom'` (stack up). Default `'bottom'`.
   *   - `axis='x'`: `'left'` (stack right), `'middle'`, `'right'`. Default `'left'`.
   */
  anchor?: DodgeAnchor;
  /**
   * Minimum padding between items in pixels.
   * @default 1
   */
  padding?: number;
  /**
   * Radius (or accessor) used for collision detection.
   * - In circular mode (default), this is the literal collision radius.
   * - In row mode (`rowHeight` set), this is the half-extent along the
   *   anchor axis (e.g. half the label width for text labels).
   *
   * Resolution priority:
   * 1. This prop, if set.
   * 2. The chart's `r` accessor (via `rScale`/`rRange`), if configured.
   * 3. Default of `5`.
   */
  r?: number | ((d: T) => number);
  /**
   * If set, switches to row-based rectangular packing instead of circular dodge.
   * Items are placed in fixed-height rows along the dodge axis; collision
   * is checked horizontally (anchor axis) using `r` as half-extent.
   *
   * Useful for text labels where circular collision would produce
   * unnecessarily large vertical gaps.
   */
  rowHeight?: number;
  /**
   * Override the anchor-axis pixel accessor.
   * For `axis='y'`, this is x; for `axis='x'`, this is y.
   * Defaults to the chart context's `xGet`/`yGet` (which applies the chart's
   * scale to the chart's `x`/`y` accessor).
   */
  position?: (d: T) => number;
  /** Snippet receives computed positions in original data order. */
  children?: Snippet<[{ items: DodgeItem<T>[] }]>;
};

export type DodgeProps<T = any> = DodgePropsWithoutHTML<T>;

type DodgeInput<T> = { x: number; r: number; data: T; index: number };

type DodgeOpts = {
  axis: 'x' | 'y';
  anchor: DodgeAnchor;
  padding: number;
  /** Chart dimension along the dodge axis (height for `axis='y'`, width for `axis='x'`). */
  size: number;
  /** When set, switch to row-based rectangular packing. */
  rowHeight?: number;
};

/**
 * Anchor descriptor: `[ky, ty]` where `ky` is the direction multiplier
 * (-1, 0, or 1) and `ty` is the baseline pixel coordinate. The dodge
 * algorithm packs items in a normalized space starting at `0`, then maps
 * back to chart space via `final = ky * packed + ty` (ky=0 treated as 1).
 *
 *  - axis='y', anchor='bottom':  [-1, size]    items stack upward from bottom
 *  - axis='y', anchor='top':     [ 1, 0]       items stack downward from top
 *  - axis='y', anchor='middle':  [ 0, size/2]  items stack symmetrically from center
 *  - axis='x', anchor='left':    [ 1, 0]
 *  - axis='x', anchor='right':   [-1, size]
 *  - axis='x', anchor='middle':  [ 0, size/2]
 */
function resolveAnchor(axis: 'x' | 'y', anchor: DodgeAnchor, size: number): [number, number] {
  if (anchor === 'middle') return [0, size / 2];
  if (axis === 'y') {
    return anchor === 'top' ? [1, 0] : [-1, size]; // bottom
  }
  return anchor === 'right' ? [-1, size] : [1, 0]; // left
}

function compareSymmetric(a: number, b: number): number {
  return Math.abs(a) - Math.abs(b);
}

function compareAscending(a: number, b: number): number {
  return a - b;
}

/**
 * Pack items along one axis so they don't overlap, given their positions on
 * the other axis. Modeled after Observable Plot's `dodge` transform — uses an
 * interval tree to find candidate positions in `O(log n + k)` per item.
 *
 * `input.x` is always the anchor-axis position regardless of `axis`. The
 * algorithm packs along the dodge axis and the wrapper swaps `x`/`y` in the
 * result for `axis='x'`.
 *
 * For text labels (where collision is more naturally rectangular), set
 * `rowHeight` to switch to row-based packing.
 *
 * @see https://observablehq.com/plot/transforms/dodge
 */
export function dodge<T>(input: DodgeInput<T>[], opts: DodgeOpts): DodgeItem<T>[] {
  if (opts.rowHeight != null) {
    return dodgeRows(input, opts as DodgeOpts & { rowHeight: number });
  }
  return dodgeCircular(input, opts);
}

/**
 * Map per-item normalized dodge-axis positions (`packed`) back to chart space
 * and package as `DodgeItem`s. Handles the axis swap for `axis='x'` (where
 * `input.x` is the chart-y anchor).
 */
function buildResult<T>(
  input: DodgeInput<T>[],
  packed: Float64Array,
  axis: 'x' | 'y',
  ky: number,
  ty: number
): DodgeItem<T>[] {
  const factor = ky === 0 ? 1 : ky;
  const result: DodgeItem<T>[] = new Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const item = input[i];
    const dodgePos = packed[i] * factor + ty;
    result[i] =
      axis === 'y'
        ? { data: item.data, x: item.x, y: dodgePos, r: item.r, index: item.index }
        : { data: item.data, x: dodgePos, y: item.x, r: item.r, index: item.index };
  }
  return result;
}

function dodgeCircular<T>(input: DodgeInput<T>[], opts: DodgeOpts): DodgeItem<T>[] {
  const { axis, anchor, padding, size } = opts;
  const [ky, ty] = resolveAnchor(axis, anchor, size);
  const compare = ky === 0 ? compareSymmetric : compareAscending;

  // `intervals[0..k]` is a flat array of [lo0, hi0, lo1, hi1, ...] forbidden
  // zones along the dodge axis for the current item. Slot 0/1 is reserved
  // for the natural anchor zone ([0, 0], a no-op zone keeping y=0 in the
  // candidate set). Tangent positions from each colliding placed item add
  // two more candidate y values each.
  const intervals = new Float64Array(2 * input.length + 2);
  const packed = new Float64Array(input.length);
  const tree = createIntervalTree();

  for (let i = 0; i < input.length; i++) {
    const item = input[i];
    const ri = item.r;
    // y0 shifts the natural anchor down by ri+padding so the item sits flush
    // against the anchor edge. middle anchor (ky=0) needs no shift.
    const y0 = ky !== 0 ? ri + padding : 0;
    const l = item.x - ri;
    const h = item.x + ri;

    let k = 2;
    tree.queryInterval(l - padding, h + padding, (interval: [number, number, number]) => {
      const j = interval[2];
      const yj = packed[j] - y0;
      const dx = item.x - input[j].x;
      const dr = ri + input[j].r + padding;
      const sq = dr * dr - dx * dx;
      if (sq >= 0) {
        const dy = Math.sqrt(sq);
        intervals[k++] = yj - dy;
        intervals[k++] = yj + dy;
      }
    });

    let candidates = Array.from(intervals.slice(0, k));
    if (ky !== 0) candidates = candidates.filter((y) => y >= 0);
    candidates.sort(compare);

    let chosen = y0; // fallback: natural anchor when nothing fits
    out: for (const y of candidates) {
      for (let j = 0; j < k; j += 2) {
        if (intervals[j] + 1e-6 < y && y < intervals[j + 1] - 1e-6) {
          continue out;
        }
      }
      chosen = y + y0;
      break;
    }
    packed[i] = chosen;

    tree.insert([l, h, i]);
  }

  return buildResult(input, packed, axis, ky, ty);
}

/**
 * Row-based rectangular packing — same interval-tree query as circular dodge,
 * but we only care which rows are already occupied in the overlap range.
 * Items are placed in the lowest free row at fixed `rowHeight` increments.
 *
 * Useful for text labels where treating each label as a circle of radius
 * `labelWidth/2` would produce unnecessarily large vertical gaps.
 */
function dodgeRows<T>(
  input: DodgeInput<T>[],
  opts: DodgeOpts & { rowHeight: number }
): DodgeItem<T>[] {
  const { axis, anchor, padding, size, rowHeight } = opts;
  const [ky, ty] = resolveAnchor(axis, anchor, size);

  const rows = new Int32Array(input.length);
  const packed = new Float64Array(input.length);
  const tree = createIntervalTree();

  for (let i = 0; i < input.length; i++) {
    const item = input[i];
    const l = item.x - item.r;
    const h = item.x + item.r;

    const used = new Set<number>();
    tree.queryInterval(l - padding, h + padding, (interval: [number, number, number]) => {
      used.add(rows[interval[2]]);
    });

    let row = 0;
    while (used.has(row)) row++;
    rows[i] = row;

    if (ky === 0) {
      // middle: alternate above/below (even rows above, odd rows below)
      const sign = row % 2 === 0 ? -1 : 1;
      const step = Math.floor(row / 2) + (row === 0 ? 0 : 1);
      packed[i] = sign * step * rowHeight;
    } else {
      // start/end: stack outward from the anchor edge
      packed[i] = row * rowHeight + rowHeight / 2;
    }

    tree.insert([l, h, i]);
  }

  return buildResult(input, packed, axis, ky, ty);
}
