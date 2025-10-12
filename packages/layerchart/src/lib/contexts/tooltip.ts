import { Context } from 'runed';
import type { TooltipPayload } from '$lib/components/tooltip/tooltipMetaContext.js';
import type { TooltipMode } from '$lib/components/tooltip/TooltipContext.svelte';

const _TooltipContext = new Context<TooltipContextValue>('TooltipContext');

export type TooltipContextValue<T = any> = {
  x: number;
  y: number;
  data: T | null;
  payload: TooltipPayload[];
  show(
    e: PointerEvent | MouseEvent | TouchEvent,
    tooltipData?: any,
    payload?: TooltipPayload
  ): void;
  hide(e?: PointerEvent): void;
  mode: TooltipMode;
  isHoveringTooltipArea: boolean;
  isHoveringTooltipContent: boolean;
};

export function getTooltipContext<T = any>() {
  return _TooltipContext.get() as TooltipContextValue<T>;
}

export function setTooltipContext<T = any>(tooltip: TooltipContextValue<T>) {
  return _TooltipContext.set(tooltip) as TooltipContextValue<T>;
}
