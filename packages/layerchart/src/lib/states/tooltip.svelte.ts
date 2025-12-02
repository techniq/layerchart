import type { TooltipPayload } from '$lib/components/tooltip/tooltipMetaContext.js';
import type { TooltipMode } from '$lib/components/tooltip/TooltipContext.svelte';

export class TooltipState<T = any> {
  x = $state(0);
  y = $state(0);
  data = $state<T | null>(null);
  payload = $state<TooltipPayload[]>([]);
  isHoveringTooltipArea = $state(false);
  isHoveringTooltipContent = $state(false);

  mode: TooltipMode;
  show: (
    e: PointerEvent | MouseEvent | TouchEvent,
    tooltipData?: any,
    payload?: TooltipPayload
  ) => void;
  hide: (e?: PointerEvent) => void;

  constructor(
    mode: TooltipMode,
    show: (
      e: PointerEvent | MouseEvent | TouchEvent,
      tooltipData?: any,
      payload?: TooltipPayload
    ) => void,
    hide: (e?: PointerEvent) => void
  ) {
    this.mode = mode;
    this.show = show;
    this.hide = hide;
  }
}
