import { Context } from 'runed';
import type { TooltipState } from '$lib/states/tooltip.svelte.js';

const _TooltipContext = new Context<TooltipState>('TooltipContext');

export function getTooltipContext<T = any>() {
  return _TooltipContext.get() as TooltipState<T>;
}

export function setTooltipContext<T = any>(tooltip: TooltipState<T>) {
  return _TooltipContext.set(tooltip) as TooltipState<T>;
}
