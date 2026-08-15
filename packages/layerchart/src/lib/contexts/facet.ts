import { Context } from 'runed';

import { chartDataArray } from '$lib/utils/common.js';
import { getChartContext } from '$lib/contexts/chart.js';
import type { Facet } from '$lib/states/facet.svelte.js';

/**
 * The panel a component is rendering into, or `undefined` outside a faceted chart.
 *
 * Read during init, as with any context.  Returns a getter so reads stay current as the panels
 * are rebuilt.  Marks usually want `getMarkData()` rather than this.
 */
const _FacetPanelContext = new Context<() => Facet>('FacetPanelContext');

export function getFacetPanel(): (() => Facet) | undefined {
  return _FacetPanelContext.getOr(undefined as unknown as () => Facet) ?? undefined;
}

export function setFacetPanel(getPanel: () => Facet) {
  return _FacetPanelContext.set(getPanel);
}

/**
 * Resolves the rows a mark should draw: its own `data` when given, else the panel it's rendering
 * into, else the chart's.
 *
 * Call during init (a component's setup, or a state class field initializer) — it reads context —
 * then call the returned resolver from wherever the data is needed, including inside a `$derived`.
 *
 * Marks resolve this rather than the chart context being swapped underneath them, so what a mark
 * draws stays visible at its own call site.
 */
export function getMarkData(): (own?: any) => any[] {
  const ctx = getChartContext();
  const panel = getFacetPanel();
  return (own?: any) => chartDataArray(own ?? panel?.().data ?? ctx.data);
}
