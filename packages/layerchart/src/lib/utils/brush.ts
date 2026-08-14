// Internal helpers behind `BrushState.contains()`.  Kept unexported from the package: the
// method is the public surface, and d3-brush offers no equivalent to mirror (its `brushSelection`
// is in pixel space, so every d3 example converts through scales by hand).

/**
 * An inclusive `[min, max]` range.  A `null` end is open — it does not constrain that side.
 *
 * Typed as a loose array to match `BrushDomainType`, which may hold fewer than two entries.
 */
export type Extent = readonly any[] | null | undefined;

/**
 * Whether a value falls within an inclusive `[min, max]` extent.
 *
 * A missing extent, or a `null` at either end, leaves that side unconstrained — so an inactive
 * brush (`[null, null]`) contains everything.
 *
 * Intended for continuous and temporal values.  Categorical (band/point) values would compare
 * lexicographically, which is rarely what you want; compare positions in the domain instead.
 */
export function isWithinExtent(value: any, extent: Extent): boolean {
  if (extent == null) return true;
  const min = extent[0];
  const max = extent[1];
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
}

/**
 * Whether a point falls within a selection's `x` and `y` extents — an axis with no selection is
 * unconstrained.
 *
 * Works with anything exposing `x` / `y` extents: a chart's `context.brush`, a group's
 * `group.brush`, or plain domain state.
 *
 * ```svelte
 * {@const isSelected = isWithinSelection(context.brush, { x: d.date, y: d.value })}
 * ```
 */
export function isWithinSelection(
  selection: { x?: Extent; y?: Extent } | null | undefined,
  point: { x?: any; y?: any }
): boolean {
  if (selection == null) return true;
  return (
    (point.x === undefined || isWithinExtent(point.x, selection.x)) &&
    (point.y === undefined || isWithinExtent(point.y, selection.y))
  );
}
