import { accessor } from './common.js';

/**
 * One sequence of rows the arrow keys step through — a series, or the positions every series
 * shares.
 */
export type KeyboardNavGroup = {
  /** Series (or `c` category) key, or `null` for the shared positions / the lone default series */
  key: string | null;
  /** Rows in visual order (by facet panel, then along the position axis) */
  rows: any[];
};

export type KeyboardNav = {
  /** One group per visible series, in series order */
  series: KeyboardNavGroup[];
  /**
   * Every position once, for charts whose tooltip shows all series at a position (ex. `bisect-x`,
   * `band`).  Navigating it is what the pointer does when scrubbing across the chart.  `null` when
   * there is only one series, or the tooltip resolves to a single point (`quadtree`, `voronoi`).
   */
  positions: KeyboardNavGroup | null;
};

export type KeyboardNavStep =
  | 'next'
  | 'previous'
  | 'first'
  | 'last'
  | 'nextSeries'
  | 'previousSeries';

/** Where keyboard navigation is: a row, and the series it is navigating (`null` for positions) */
export type KeyboardNavTarget = { data: any; seriesKey: string | null };

/**
 * The subset of the chart context needed to build the navigation.  Accepts a full `ChartState`, but
 * typed structurally so it can be used with test fixtures.
 */
export type KeyboardNavContext = {
  flatData: any[];
  valueAxis: 'x' | 'y' | 'z';
  xGet: (d: any) => any;
  yGet: (d: any) => any;
  cKey: (d: any) => any;
  cGroups: any[] | null;
  series: {
    isDefaultSeries: boolean;
    visibleSeries: Array<{ key: string; value?: any; data?: any[] }>;
  };
  facet?: { enabled: boolean; panels: Array<{ has(row: any): boolean }> };
};

/**
 * Where a row sits visually: the facet panel it belongs to, then its pixel position along the
 * position axis — `y` on a horizontal chart, and `x` otherwise (including an `isometric` chart whose
 * value is the height, `z`).
 *
 * Pixels rather than domain values, so the order is the one on screen whatever the scale — a band
 * scale's domain order, a reversed range, dates and numbers alike.
 */
function positionOf(ctx: KeyboardNavContext, d: any): [panel: number, pixel: number] {
  const panel = ctx.facet?.enabled ? ctx.facet.panels.findIndex((p) => p.has(d)) : 0;
  const scaled = ctx.valueAxis === 'x' ? ctx.yGet(d) : ctx.xGet(d);
  const pixel = Array.isArray(scaled) ? scaled[0] : scaled;
  return [panel, Number(pixel)];
}

function byPosition(ctx: KeyboardNavContext, rows: any[]) {
  return rows
    .map((d) => ({ d, position: positionOf(ctx, d) }))
    .sort((a, b) => a.position[0] - b.position[0] || a.position[1] - b.position[1]);
}

/**
 * Build the groups keyboard navigation steps through.
 *
 * Built from the chart's own data on demand, so a chart pays nothing for it until a key is
 * pressed.
 */
export function keyboardNav(
  ctx: KeyboardNavContext,
  options: { singlePoint?: boolean } = {}
): KeyboardNav {
  const sorted = byPosition(ctx, ctx.flatData);
  const rows = sorted.map((s) => s.d);

  let series: KeyboardNavGroup[];

  if (ctx.cGroups && ctx.series.isDefaultSeries) {
    // Long data grouped by `c` — the categories are the series.  Rows of a category the legend
    // hides are already gone from `flatData`, so its group is empty and dropped.
    series = ctx.cGroups
      .map((key) => ({ key, rows: rows.filter((d) => ctx.cKey(d) === key) }))
      .filter((g) => g.rows.length > 0);
  } else if (!ctx.series.isDefaultSeries) {
    series = ctx.series.visibleSeries.map((s) => {
      if (s.data) {
        // `flatData` tags rows sourced from a series' own data with its key.  A chart given its own
        // `data` too doesn't, so those rows are navigated from the series directly.
        const tagged = rows.filter((d) => d.seriesKey === s.key);
        return { key: s.key, rows: tagged.length ? tagged : byPosition(ctx, s.data).map((p) => p.d) }; // prettier-ignore
      }

      // Wide data — every series reads its value from the same rows, so skip the rows where this
      // one has none (a gap in the line).  An accessor that reads nothing at all (ex. a computed
      // series) keeps every row rather than leaving nothing to navigate.
      const valueOf = accessor(s.value ?? s.key);
      const defined = rows.filter((d) => valueOf(d) != null);
      return { key: s.key, rows: defined.length ? defined : rows };
    });
  } else {
    series = [{ key: null, rows }];
  }

  let positions: KeyboardNavGroup | null = null;
  if (!options.singlePoint && series.length > 1) {
    // One row per position — the tooltip resolves every series there from it
    const unique = sorted.filter(
      (s, i) =>
        i === 0 ||
        s.position[0] !== sorted[i - 1].position[0] ||
        s.position[1] !== sorted[i - 1].position[1]
    );
    positions = { key: null, rows: unique.map((s) => s.d) };
  }

  return { series, positions };
}

/** The group `seriesKey` names, falling back to the positions, then whichever group holds `data` */
function currentGroup(nav: KeyboardNav, current: KeyboardNavTarget | null) {
  if (current?.seriesKey != null) {
    const group = nav.series.find((g) => g.key === current.seriesKey);
    if (group) return group;
  }
  return (
    nav.positions ??
    (current?.data != null ? nav.series.find((g) => g.rows.includes(current.data)) : undefined) ??
    nav.series[0]
  );
}

/**
 * Index of `data` in `group`, or of the row nearest it when it isn't one of them — ex. a row the
 * pointer resolved to, or one from another series.  `-1` when there is nothing current.
 */
function indexIn(ctx: KeyboardNavContext, group: KeyboardNavGroup, data: any) {
  if (data == null || group.rows.length === 0) return -1;

  const index = group.rows.indexOf(data);
  if (index !== -1) return index;

  const [panel, pixel] = positionOf(ctx, data);
  let nearest = 0;
  let nearestDistance = Infinity;
  group.rows.forEach((d, i) => {
    const [p, x] = positionOf(ctx, d);
    // Another panel is always farther than anywhere in this one
    const distance = (p === panel ? 0 : 1e9 * (1 + Math.abs(p - panel))) + Math.abs(x - pixel);
    if (distance < nearestDistance) {
      nearest = i;
      nearestDistance = distance;
    }
  });
  return nearest;
}

/**
 * Where a keyboard step lands, from where navigation currently is.  `undefined` when there is
 * nothing to navigate.
 *
 * Moving along a group stops at its ends.  Moving between series keeps the same row when the
 * next series has it (wide data), and otherwise lands on its row nearest the current position.
 * From the positions, either series step enters the series — `nextSeries` the first, and
 * `previousSeries` the last.
 */
export function keyboardNavStep(
  ctx: KeyboardNavContext,
  nav: KeyboardNav,
  current: KeyboardNavTarget | null,
  step: KeyboardNavStep
): KeyboardNavTarget | undefined {
  const group = currentGroup(nav, current);
  if (!group || group.rows.length === 0) return undefined;

  const data = current?.data ?? null;
  const index = indexIn(ctx, group, data);
  const last = group.rows.length - 1;

  switch (step) {
    case 'next':
      return { data: group.rows[index === -1 ? 0 : Math.min(index + 1, last)], seriesKey: group.key }; // prettier-ignore
    case 'previous':
      return { data: group.rows[index === -1 ? last : Math.max(index - 1, 0)], seriesKey: group.key }; // prettier-ignore
    case 'first':
      return { data: group.rows[0], seriesKey: group.key };
    case 'last':
      return { data: group.rows[last], seriesKey: group.key };

    case 'nextSeries':
    case 'previousSeries': {
      const groupIndex = nav.series.indexOf(group);
      const targetIndex =
        groupIndex === -1
          ? step === 'nextSeries'
            ? 0
            : nav.series.length - 1
          : Math.max(0, Math.min(groupIndex + (step === 'nextSeries' ? 1 : -1), nav.series.length - 1)); // prettier-ignore
      const target = nav.series[targetIndex];
      if (!target || target.rows.length === 0) return undefined;

      // Keep the row when the target series has it, otherwise its row nearest the current one
      const targetRow =
        data != null && target.rows.includes(data)
          ? data
          : target.rows[Math.max(0, indexIn(ctx, target, data))];
      return { data: targetRow, seriesKey: target.key };
    }
  }
}
