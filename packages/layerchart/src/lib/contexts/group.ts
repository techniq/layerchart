import { createContext } from 'svelte';
import { ChartGroupState } from '$lib/states/group.svelte.js';

const [_getChartGroup, _setChartGroup, _hasChartGroup] = createContext<ChartGroupState>();

/**
 * Get the chart group provided by an ancestor `<ChartGroup>`, or `undefined` when there is none.
 *
 * Charts prefer an explicit `group` prop and fall back to this.
 */
export function getChartGroup(): ChartGroupState | undefined {
  return _hasChartGroup() ? _getChartGroup() : undefined;
}

export function setChartGroup(group: ChartGroupState): ChartGroupState | undefined {
  return _setChartGroup(group);
}
