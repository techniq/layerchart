import { getChartContext } from '$lib/components/Chart.svelte';

// TODO: Should we support the full `DomainType` (`string`, etc)
// type BrushDomainType = NonNullable<DomainType>;
export type BrushDomainType = Array<number | Date | null>;

export type BrushRange = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export class BrushState {
  ctx: ReturnType<typeof getChartContext> | null;

  x = $state<BrushDomainType>([null, null]);
  y = $state<BrushDomainType>([null, null]);
  active = $state<boolean>();
  axis = $state<'x' | 'y' | 'both'>('x');
  handleSize = $state(0);

  constructor(
    ctx: typeof this.ctx,
    options?: {
      x?: BrushDomainType;
      y?: BrushDomainType;
      active?: boolean;
      axis?: 'x' | 'y' | 'both';
    }
  ) {
    this.ctx = ctx;

    this.x = options?.x ?? [null, null];
    this.y = options?.y ?? [null, null];
    // this.active = options?.active ?? (this.x !== null || this.y !== null);
    this.active = options?.active;
    this.axis = options?.axis ?? 'x';
  }

  get range() {
    if (!this.ctx) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const top = this.ctx.yScale(this.y?.[1]);
    const bottom = this.ctx.yScale(this.y?.[0]);
    const left = this.ctx.xScale(this.x?.[0]);
    const right = this.ctx.xScale(this.x?.[1]);

    return {
      x: this.axis === 'both' || this.axis === 'x' ? left : 0,
      y: this.axis === 'both' || this.axis === 'y' ? top : 0,
      width: this.axis === 'both' || this.axis === 'x' ? right - left : this.ctx.width,
      height: this.axis === 'both' || this.axis === 'y' ? bottom - top : this.ctx.height,
    };
  }
}
