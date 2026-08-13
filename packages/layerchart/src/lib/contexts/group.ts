import { Context } from 'runed';
import { ChartGroupState } from '$lib/states/group.svelte.js';

export { ChartGroupState, resolvePointerData } from '$lib/states/group.svelte.js';
export type {
  ChartGroupPointer,
  ChartGroupPointerOptions,
  ChartGroupMemberOptions,
  ChartGroupOptions,
  ChartGroupSlice,
  PointerMatch,
} from '$lib/states/group.svelte.js';

const _ChartGroupContext = new Context<ChartGroupState | undefined>('ChartGroupContext');

/**
 * Get the chart group provided by an ancestor `<ChartGroup>`, or `undefined` when there is none.
 *
 * Charts prefer an explicit `group` prop and fall back to this.
 */
export function getChartGroup(): ChartGroupState | undefined {
  return _ChartGroupContext.getOr(undefined);
}

export function setChartGroup(group: ChartGroupState): ChartGroupState | undefined {
  return _ChartGroupContext.set(group);
}
