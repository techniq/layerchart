import type { IsometricView } from './isometric.js';

/** How a chart's plot is seen.  Without one, it's drawn flat. */
export type ChartView = IsometricView;

/** A `view`, or a view function to call with its defaults (ex. `view={isometric}`) */
export type ChartViewProp = ChartView | (() => ChartView);

/** The view a `view` prop names, calling a view function for its defaults */
export function resolveView(view: ChartViewProp | null | undefined): ChartView | null {
  if (view == null) return null;
  return typeof view === 'function' ? view() : view;
}
