/**
 * The state classes behind a chart's contexts, and the types configuring them.
 *
 * Named exports rather than `export *`, unlike the component/context/util barrels — every state
 * module also holds helpers that are ours rather than yours (`facetKey`, `defaultSettings`,
 * `expandBandBrushDomain`, and so on), which stay unpublished.
 */

/**
 * `ChartState` is a type only — a chart builds its own, and everything else reads it through
 * `getChartContext()`.
 */
export type {
  ChartState,
  MarkInfo,
  NodeKind,
  ComponentNode,
  RegisterComponentOptions,
} from './chart.svelte.js';

export { BrushState } from './brush.svelte.js';
export type { BrushDomainType, BrushExtent, BrushRange, BrushSelection } from './brush.svelte.js';

export { FacetState } from './facet.svelte.js';
export type { Facet, FacetOptions } from './facet.svelte.js';

export { GeoState } from './geo.svelte.js';
export type { GeoStateProps } from './geo.svelte.js';

export { ChartGroupState } from './group.svelte.js';
export type {
  ChartGroupBrush,
  ChartGroupBrushOptions,
  ChartGroupDomain,
  ChartGroupDomainOptions,
  ChartGroupMemberOptions,
  ChartGroupOptions,
  ChartGroupPointer,
  ChartGroupPointerOptions,
  ChartGroupSeries,
  ChartGroupSeriesOptions,
  ChartGroupSlice,
  PointerMatch,
} from './group.svelte.js';

export { SeriesState } from './series.svelte.js';
export type { StackConfig, StackLayout } from './series.svelte.js';

export { Settings } from './settings.svelte.js';
export type { SettingsOptions } from './settings.svelte.js';

export { TooltipState } from './tooltip.svelte.js';
export type { TooltipSeries, TooltipShow, TooltipShowOptions } from './tooltip.svelte.js';

export { TransformState } from './transform.svelte.js';
export type {
  InertiaOptions,
  ScrollActivationKey,
  TransformAxis,
  TransformConstraint,
  TransformMode,
  TransformScrollMode,
  TransformStateOptions,
} from './transform.svelte.js';
