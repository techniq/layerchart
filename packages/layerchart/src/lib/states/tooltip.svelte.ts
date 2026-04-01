import type { TooltipMode } from '$lib/components/tooltip/TooltipContext.svelte';
import type { SeriesData } from '$lib/components/charts/types.js';

export type TooltipSeries = {
  key: string;
  label: string;
  value: any;
  color?: string;
  visible: boolean;
  config: SeriesData<any, any>;
};

export class TooltipState<T = any> {
  x = $state(0);
  y = $state(0);
  data = $state<T | null>(null);
  series = $state<TooltipSeries[]>([]);
  isHoveringTooltipArea = $state(false);
  isHoveringTooltipContent = $state(false);

  mode: TooltipMode;
  show: (e: PointerEvent | MouseEvent | TouchEvent, tooltipData?: any) => void;
  hide: (e?: PointerEvent) => void;

  constructor(
    mode: TooltipMode,
    show: (e: PointerEvent | MouseEvent | TouchEvent, tooltipData?: any) => void,
    hide: (e?: PointerEvent) => void
  ) {
    this.mode = mode;
    this.show = show;
    this.hide = hide;
  }
}
