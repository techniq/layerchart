import type { Snippet } from 'svelte';

/**
 * Centered-interval-tree variant: an augmented BST keyed by `lo`, with each
 * node carrying `maxHi` across its subtree. Queries skip whole subtrees whose
 * `maxHi < lo` (no possible overlap), giving `O(log n + k)` per query in the
 * average case.
 *
 * Same `insert` + `queryInterval` API as `interval-tree-1d` (used by Observable
 * Plot and SveltePlot). For ~4k+ items this is dramatically faster than a
 * linear scan; for tiny inputs the tree overhead is negligible. Tree is not
 * self-balancing, but dodge inputs distribute `lo` ≈ uniformly along the
 * anchor axis, so depth stays close to `O(log n)` in practice.
 */
type Interval = [lo: number, hi: number, id: number];

type IntervalNode = {
  interval: Interval;
  maxHi: number;
  left: IntervalNode | null;
  right: IntervalNode | null;
};

function createIntervalTree() {
  let root: IntervalNode | null = null;

  function insertInto(node: IntervalNode | null, interval: Interval): IntervalNode {
    if (!node) {
      return { interval, maxHi: interval[1], left: null, right: null };
    }
    if (interval[0] < node.interval[0]) {
      node.left = insertInto(node.left, interval);
    } else {
      node.right = insertInto(node.right, interval);
    }
    if (interval[1] > node.maxHi) node.maxHi = interval[1];
    return node;
  }

  function queryNode(
    node: IntervalNode | null,
    lo: number,
    hi: number,
    visit: (interval: Interval) => void
  ) {
    if (!node || node.maxHi < lo) return;
    queryNode(node.left, lo, hi, visit);
    const it = node.interval;
    if (it[0] <= hi && it[1] >= lo) visit(it);
    // Once `it[0] > hi` the right subtree (all `lo >= it[0]`) cannot overlap.
    if (it[0] <= hi) queryNode(node.right, lo, hi, visit);
  }

  return {
    insert(interval: Interval) {
      root = insertInto(root, interval);
    },
    queryInterval(lo: number, hi: number, visit: (interval: Interval) => void) {
      queryNode(root, lo, hi, visit);
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
  /**
   * Pixel coordinate (along the dodge axis) of the line items grow away from:
   * the centerline for `anchor='middle'`, the edge for the others.
   *
   * Default depends on `axis` + `anchor`:
   * - `axis='y'`: `0` (top), `ctx.height / 2` (middle), `ctx.height` (bottom)
   * - `axis='x'`: `0` (left), `ctx.width / 2` (middle), `ctx.width` (right)
   *
   * Pass a custom value to dodge within a sub-region — e.g. a band scale's
   * `bandLeft + bandwidth/2` for per-band beeswarms, or a horizontal
   * baseline pixel for split top/bottom timeline labels. Output positions
   * are in chart coordinates (no snippet translation needed).
   */
  baseline?: number;
  /** Snippet receives computed positions in original data order. */
  children?: Snippet<[{ items: DodgeItem<T>[] }]>;
};

export type DodgeProps<T = any> = DodgePropsWithoutHTML<T>;

type DodgeInput<T> = { x: number; r: number; data: T; index: number };

type DodgeOpts = {
  axis: 'x' | 'y';
  anchor: DodgeAnchor;
  padding: number;
  /** Pixel coordinate (along the dodge axis) of the line items grow away from. */
  baseline: number;
  /** When set, switch to row-based rectangular packing. */
  rowHeight?: number;
};

/**
 * Direction multiplier for an anchor along its dodge axis.
 *
 *  - `'top'` / `'left'`:    `+1` — items grow at increasing chart coord
 *  - `'bottom'` / `'right'`: `-1` — items grow at decreasing chart coord
 *  - `'middle'`:              `0` — items spread symmetrically (algorithm
 *    treats this specially, not multiplied)
 *
 * Combined with `baseline` (the anchor's pixel coordinate), the algorithm
 * maps a packed local position `p` to chart coords via `baseline + dir * p`
 * (or `baseline ± p` for middle).
 */
function anchorDirection(axis: 'x' | 'y', anchor: DodgeAnchor): number {
  if (anchor === 'middle') return 0;
  if (axis === 'y') return anchor === 'top' ? 1 : -1; // bottom
  return anchor === 'right' ? -1 : 1; // left
}

function compareSymmetric(a: number, b: number): number {
  return Math.abs(a) - Math.abs(b);
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
  dir: number,
  baseline: number
): DodgeItem<T>[] {
  const factor = dir === 0 ? 1 : dir;
  const result: DodgeItem<T>[] = new Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const item = input[i];
    const dodgePos = packed[i] * factor + baseline;
    result[i] =
      axis === 'y'
        ? { data: item.data, x: item.x, y: dodgePos, r: item.r, index: item.index }
        : { data: item.data, x: dodgePos, y: item.x, r: item.r, index: item.index };
  }
  return result;
}

function dodgeCircular<T>(input: DodgeInput<T>[], opts: DodgeOpts): DodgeItem<T>[] {
  const { axis, anchor, padding, baseline } = opts;
  const dir = anchorDirection(axis, anchor);
  const isMiddle = dir === 0;

  // `intervals[0..k]` is a flat array of [lo0, hi0, lo1, hi1, ...] forbidden
  // zones along the dodge axis for the current item. Slot 0/1 is reserved
  // for the natural anchor zone ([0, 0], a no-op zone keeping y=0 in the
  // candidate set). Tangent positions from each colliding placed item add
  // two more candidate y values each. `candidates` is a parallel buffer for
  // the sortable copy — pre-allocated once to avoid per-iteration allocation.
  const cap = 2 * input.length + 2;
  const intervals = new Float64Array(cap);
  const candidates = new Float64Array(cap);
  const packed = new Float64Array(input.length);
  const tree = createIntervalTree();

  for (let i = 0; i < input.length; i++) {
    const item = input[i];
    const ri = item.r;
    // y0 shifts the natural anchor by ri+padding so the item sits flush
    // against the baseline. middle anchor (dir=0) needs no shift.
    const y0 = isMiddle ? 0 : ri + padding;
    const l = item.x - ri;
    const h = item.x + ri;

    let k = 2;
    tree.queryInterval(l - padding, h + padding, (interval: Interval) => {
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

    // Sort the candidate y-values in-place into our reusable buffer. Native
    // typed-array sort is materially faster than Array.sort with a JS
    // comparator. For non-middle anchors we want ascending order (default);
    // for middle we want symmetric (closest to 0 first), which still goes
    // through the typed-array sort and avoids the prior allocation.
    const view = candidates.subarray(0, k);
    view.set(intervals.subarray(0, k));
    if (isMiddle) {
      view.sort(compareSymmetric);
    } else {
      view.sort();
    }

    let chosen = y0; // fallback: natural anchor when nothing fits
    outer: for (let c = 0; c < k; c++) {
      const y = view[c];
      // For non-middle anchors, items grow only in the +y direction relative
      // to y0 — negative candidates are below the baseline and inadmissible.
      if (!isMiddle && y < 0) continue;
      for (let j = 0; j < k; j += 2) {
        if (intervals[j] + 1e-6 < y && y < intervals[j + 1] - 1e-6) {
          continue outer;
        }
      }
      chosen = y + y0;
      break;
    }
    packed[i] = chosen;

    tree.insert([l, h, i]);
  }

  return buildResult(input, packed, axis, dir, baseline);
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
  const { axis, anchor, padding, baseline, rowHeight } = opts;
  const dir = anchorDirection(axis, anchor);

  const rows = new Int32Array(input.length);
  const packed = new Float64Array(input.length);
  const tree = createIntervalTree();

  for (let i = 0; i < input.length; i++) {
    const item = input[i];
    const l = item.x - item.r;
    const h = item.x + item.r;

    const used = new Set<number>();
    tree.queryInterval(l - padding, h + padding, (interval: Interval) => {
      used.add(rows[interval[2]]);
    });

    let row = 0;
    while (used.has(row)) row++;
    rows[i] = row;

    if (dir === 0) {
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

  return buildResult(input, packed, axis, dir, baseline);
}
