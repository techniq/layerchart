import type { ComponentProps, Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { TimeInterval } from 'd3-time';
import type { HierarchyNode } from 'd3-hierarchy';
import type { SankeyGraph } from 'd3-sankey';

import type { Accessor } from '$lib/utils/common.js';
import type { MotionProp } from '$lib/utils/motion.svelte.js';
import type { AnyScale, DomainType } from '$lib/utils/scales.svelte.js';
import type {
  BaseRange,
  Nice,
  PaddingArray,
  Without,
  XRangeWithScale,
  YRangeWithScale,
} from '$lib/utils/types.js';
import type { GeoStateProps } from '$lib/states/geo.svelte.js';
import type { StackLayout } from '$lib/states/series.svelte.js';
import type { ChartState } from '$lib/states/chart.svelte.js';

import type TooltipContext from '../tooltip/TooltipContext.svelte';
import type TransformContext from '../TransformContext.svelte';
import type BrushContext from '../BrushContext.svelte';
import type { ChartChildrenProps } from '../ChartChildren/ChartChildren.shared.svelte.js';
import type { SeriesData } from '../charts/types.js';

export type ChartResizeDetail = {
  width: number;
  height: number;
  containerWidth: number;
  containerHeight: number;
};

export type PreservedChartConfig<
  T,
  XScale extends AnyScale = AnyScale,
  YScale extends AnyScale = AnyScale,
> = Pick<
  ChartPropsWithoutHTML<T, XScale, YScale>,
  | 'x'
  | 'y'
  | 'z'
  | 'r'
  | 'c'
  | 'x1'
  | 'y1'
  | 'xRange'
  | 'yRange'
  | 'cDomain'
  | 'zDomain'
  | 'xDomain'
  | 'yDomain'
  | 'rDomain'
  | 'x1Domain'
  | 'y1Domain'
  | 'zRange'
  | 'rRange'
  | 'cRange'
  | 'x1Range'
  | 'y1Range'
>;

export type LayerChartInternalMeta = {
  /**
   * The current chart type.
   * The default is `'default'` which is any chart being composed
   * that isn't a "simplified chart".
   */
  type:
    | 'default'
    | 'simplified-area'
    | 'simplified-bar'
    | 'simplified-line'
    | 'simplified-pie'
    | 'simplified-scatter';
};

export type ChartPropsWithoutHTML<
  T,
  XScale extends AnyScale = AnyScale,
  YScale extends AnyScale = AnyScale,
> = {
  /**
   * Whether this chart should be rendered server side
   *
   * @default false
   */
  ssr?: boolean;

  /**
   * Whether to allow pointer events via CSS.
   * Set this to `false` to set `pointer-events: none;` on all components, disabling
   * all mouse interactions.
   *
   * @default true
   */
  pointerEvents?: boolean;

  /**
   * Determine the positioning of the wrapper div.
   * Set this to `'absolute'` when you want to stack layers.
   *
   * @default 'relative'
   */
  position?: string;

  /**
   * If `true`, set all scale ranges to `[0, 100]`.
   * Ranges reversed via `xReverse`, `yReverse`, or `rReverse` props will
   * continue to be reversed as usual.
   * @default false
   */
  percentRange?: boolean;

  /**
   * A bindable reference to the root container element.
   */
  ref?: HTMLElement;

  /**
   * If `data` is not a flat array of objects and you want to use any of the scales, set a flat
   * version of the data via the `flatData` prop.
   */
  data?: T[] | readonly T[] | HierarchyNode<T> | SankeyGraph<any, any>;

  /** A flat version of data. */
  flatData?: T[] | readonly T[] | HierarchyNode<T> | SankeyGraph<any, any>;

  x?: Accessor<T>;
  y?: Accessor<T>;
  z?: Accessor<T>;
  r?: Accessor<T>;
  x1?: Accessor<T>;
  y1?: Accessor<T>;
  c?: Accessor<T>;

  xDomain?: DomainType;
  yDomain?: DomainType;
  zDomain?: DomainType;
  rDomain?: DomainType;
  x1Domain?: DomainType;
  y1Domain?: DomainType;
  cDomain?: DomainType;

  xNice?: Nice;
  yNice?: Nice;
  zNice?: Nice;
  rNice?: Nice;

  xPadding?: PaddingArray;
  yPadding?: PaddingArray;
  zPadding?: PaddingArray;
  rPadding?: PaddingArray;

  xScale?: XScale;
  yScale?: YScale;
  zScale?: AnyScale;
  rScale?: AnyScale;
  x1Scale?: AnyScale;
  y1Scale?: AnyScale;
  cScale?: AnyScale;

  xRange?: BaseRange;
  yRange?: BaseRange;
  zRange?: BaseRange;
  rRange?: BaseRange;
  x1Range?: XRangeWithScale<XScale>;
  y1Range?: YRangeWithScale<YScale>;
  cRange?: string[] | readonly string[];

  xReverse?: boolean;
  yReverse?: boolean;
  zReverse?: boolean;
  rReverse?: boolean;

  xDomainSort?: boolean;
  yDomainSort?: boolean;
  zDomainSort?: boolean;
  rDomainSort?: boolean;

  padding?: { top?: number; right?: number; bottom?: number; left?: number } | number;

  extents?: {
    x?: [min: number, max: number];
    y?: [min: number, max: number];
    r?: [min: number, max: number];
    z?: [min: number, max: number];
  };

  meta?: Record<string, any>;
  debug?: boolean;
  verbose?: boolean;
  xBaseline?: number | null;
  yBaseline?: number | null;
  xInterval?: TimeInterval | null;
  yInterval?: TimeInterval | null;
  valueAxis?: 'x' | 'y';
  radial?: boolean;

  children?: Snippet<[{ context: ChartState<T, XScale, YScale> }]>;

  context?: ChartState<T, XScale, YScale>;

  geo?: Partial<GeoStateProps>;

  tooltipContext?: Partial<ComponentProps<typeof TooltipContext>> | boolean;

  transform?: Partial<ComponentProps<typeof TransformContext>> & {
    apply?: {
      rotation?: boolean;
      scale?: boolean;
      translate?: boolean;
    };
    domainExtent?: {
      x?: {
        min?: number | Date | 'data';
        max?: number | Date | 'data';
        minRange?: number;
      };
      y?: {
        min?: number | Date | 'data';
        max?: number | Date | 'data';
        minRange?: number;
      };
    };
  };

  brush?:
    | (Partial<ComponentProps<typeof BrushContext>> & {
        zoomOnBrush?: boolean;
      })
    | boolean;

  series?: SeriesData<T, any>[];

  seriesLayout?: StackLayout | 'group';

  bandPadding?: number;
  groupPadding?: number;

  onResize?: (e: ChartResizeDetail) => void;

  clip?: boolean;

  motion?: MotionProp;

  ondragstart?: ComponentProps<typeof TransformContext>['ondragstart'];
  ondragend?: ComponentProps<typeof TransformContext>['ondragend'];
  onTransform?: ComponentProps<typeof TransformContext>['onTransform'];

  width?: number;
  height?: number;
} & ChartChildrenProps<T, XScale, YScale>;

export type ChartProps<
  T,
  XScale extends AnyScale = AnyScale,
  YScale extends AnyScale = AnyScale,
> = ChartPropsWithoutHTML<T, XScale, YScale> &
  Without<HTMLAttributes<HTMLDivElement>, ChartPropsWithoutHTML<T, XScale, YScale>>;
